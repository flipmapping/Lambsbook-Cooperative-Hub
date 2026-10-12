import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { 
  User, CreditCard, Users, BookOpen, DollarSign, 
  GraduationCap, Activity, AlertTriangle, CheckCircle,
  ArrowUpCircle, Clock, Eye, EyeOff, RefreshCw,
  Lock, Shield, Camera, Plus, Trash2, QrCode, Phone
} from "lucide-react";
import HubAdminDashboard from "@/pages/HubAdminDashboard";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/lib/LanguageContext";

type MembershipStatus = "free" | "paid";
type ActivityStatus = "active" | "inactive";
type TutorStatus = "unverified" | "verified" | "partner_educator";
type EarningStatus = "pending" | "paid" | "paused";

// ── APP-MEX-001A: Preferred Contact Method types ──────────────────────────────

type MessengerPlatform =
  | "WhatsApp"
  | "Zalo"
  | "LINE"
  | "WeChat"
  | "Telegram"
  | "Signal"
  | "KakaoTalk"
  | "Facebook Messenger"
  | "Other";

const MESSENGER_PLATFORMS: MessengerPlatform[] = [
  "WhatsApp",
  "Zalo",
  "LINE",
  "WeChat",
  "Telegram",
  "Signal",
  "KakaoTalk",
  "Facebook Messenger",
  "Other",
];

interface ContactMethod {
  id: string;
  platform: MessengerPlatform;
  handle: string;
}

// ── APP-MEX-001A: Invitation relationship type ────────────────────────────────

interface SentInvitation {
  id: string;
  invited_email: string | null;
  created_at: string;
  expires_at: string | null;
  status: "pending" | "accepted" | "expired" | string;
  note?: string | null;
  /** D2: Server-generated invitation URL for link retrieval from history */
  invitation_url?: string | null;
}


interface SubscriptionData {
  member: {
    membership_status: MembershipStatus;
    subscription_price_at_signup: number | null;
    subscription_renewal_date: string | null;
  } | null;
  subscriptions: Array<{
    id: string;
    price: number;
    renewal_date: string;
    status: string;
  }>;
  benefits: {
    free: { earning_programs: number; description: string };
    paid: { earning_programs: string; description: string };
  };
}

interface CollaborationData {
  invitor: { id: string; member_type: string } | null;
  collaboration_status: string | null;
  invitees: Array<{
    id: string;
    invitee: { id: string; member_type: string };
    status: string;
  }>;
  explanation: {
    how_it_works: string;
    earning_flow: string;
    status_meaning: { active: string; paused: string };
  };
}

interface ProgramsData {
  programs: Array<{
    id: string;
    name: string;
    sbu: string;
    revenue_base: string;
    trigger_condition: string;
    eligibility: { eligible: boolean } | null;
    can_earn: boolean;
  }>;
  membership_status: MembershipStatus;
  selected_count: number;
  max_selectable: number | string;
  can_select_more: boolean;
}

interface EarningsData {
  earnings: Array<{
    id: string;
    amount: number;
    earning_status: EarningStatus;
    period: string;
    program: { name: string; sbu: string };
  }>;
  summary: {
    pending: number;
    paid: number;
    paused: number;
    total: number;
  };
  hidden: boolean;
  message?: string;
  status_explanation: Record<string, string>;
}

interface TutorData {
  tutor: {
    id: string;
    tutor_type: string;
    tutor_status: TutorStatus;
    free_class_minutes_last_30_days: number;
  } | null;
  is_visible: boolean;
  visibility_explanation: {
    requirement: string;
    free_class: string;
    status_levels: Record<string, string>;
  };
}

interface ActivityData {
  activity_status: ActivityStatus;
  last_activity_at: string | null;
  recent_logs: Array<{
    id: string;
    activity_type: string;
    created_at: string;
  }>;
  warning: { message: string; consequence: string; action: string } | null;
  reactivation: { message: string; consequence: string; action: string } | null;
  inactivity_threshold: string;
}

function getAuthToken(): string | null {
  try {
    const tokenData = localStorage.getItem("supabase.auth.token");
    if (!tokenData) return null;
    const parsed = JSON.parse(tokenData);
    return parsed.access_token || null;
  } catch {
    return null;
  }
}

// ============================================================================
// APP-MEX-001D — Backend-backed Profile Preference Persistence
// ----------------------------------------------------------------------------
// Primary: GET/PUT /api/member/profile/preferences (backend)
// Fallback: localStorage keyed by userId (compatibility layer from APP-MEX-001C)
// Backend supersedes localStorage when available.
// ============================================================================

const PROFILE_STORE_KEY = (userId: string) =>
  `lambsbook.profile.${userId}`;

interface PersistedProfile {
  visibility: "private" | "public";
  contactMethods: ContactMethod[];
  avatarDataUrl: string | null;
}

function loadLocalProfile(userId: string): PersistedProfile {
  try {
    const raw = localStorage.getItem(PROFILE_STORE_KEY(userId));
    if (!raw) {
      return { visibility: "private", contactMethods: [], avatarDataUrl: null };
    }
    const parsed = JSON.parse(raw) as Partial<PersistedProfile>;
    return {
      visibility: parsed.visibility === "public" ? "public" : "private",
      contactMethods: Array.isArray(parsed.contactMethods)
        ? parsed.contactMethods
        : [],
      avatarDataUrl: typeof parsed.avatarDataUrl === "string"
        ? parsed.avatarDataUrl
        : null,
    };
  } catch {
    return { visibility: "private", contactMethods: [], avatarDataUrl: null };
  }
}

function saveLocalProfile(userId: string, data: PersistedProfile): void {
  try {
    localStorage.setItem(PROFILE_STORE_KEY(userId), JSON.stringify(data));
  } catch {
    // Storage unavailable — silently continue.
  }
}

async function fetchWithAuth(url: string) {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.json();
}

async function postWithAuth(url: string, data?: unknown) {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: data ? JSON.stringify(data) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.json();
}

async function putWithAuth(url: string, data?: unknown) {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: data ? JSON.stringify(data) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.status === 204 ? null : res.json();
}

async function deleteWithAuth(url: string) {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(url, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.status === 204 ? null : res.json();
}

// ── APP-MEX-001A: QR code placeholder ────────────────────────────────────────

function QrPlaceholder({ platform, handle }: { platform: MessengerPlatform; handle: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center w-24 h-24 rounded-lg border border-dashed border-muted bg-muted/20 shrink-0"
      aria-label={`QR code placeholder for ${platform} ${handle}`}
      data-testid="qr-placeholder"
    >
      <QrCode className="h-6 w-6 text-muted-foreground mb-1" />
      <span className="text-[10px] text-muted-foreground text-center leading-tight px-1">
        {platform}
      </span>
    </div>
  );
}


const memberHubTranslations: Record<string, Record<string, string>> = {
  vi: {
    "Welcome to Lambsbook Hub": "Chào mừng đến với Lambsbook Hub",
    "Please sign in to access your member dashboard.": "Vui lòng đăng nhập để truy cập bảng điều khiển thành viên.",
    "Sign In": "Đăng nhập",
    "Create Account": "Tạo tài khoản",
    "Dashboard unavailable": "Không thể mở bảng điều khiển",
    "Some operational dashboard data could not be loaded. Please refresh and try again.": "Không thể tải một số dữ liệu. Vui lòng tải lại trang và thử lại.",
    "Member Dashboard": "Bảng điều khiển thành viên",
    "Member account": "Tài khoản thành viên",
    "Inactivity Warning": "Cảnh báo không hoạt động",
    "Account Inactive": "Tài khoản không hoạt động",
    "Stay Active": "Duy trì hoạt động",
    "Reactivate Now": "Kích hoạt lại ngay",
    "Overview": "Tổng quan",
    "Profile": "Hồ sơ",
    "Membership": "Tư cách thành viên",
    "Credits": "Tín dụng",
    "Invitations": "Lời mời",
    "Relationships": "Mối quan hệ",
    "Workspace": "Không gian làm việc",
    "Member ID": "Mã thành viên",
    "Member Type": "Loại thành viên",
    "Join Date": "Ngày tham gia",
    "Last Active": "Hoạt động gần đây",
    "Private": "Riêng tư",
    "Public": "Công khai",
    "Platform": "Nền tảng",
    "Handle or phone number": "Tên tài khoản hoặc số điện thoại",
    "Membership Overview": "Tổng quan tư cách thành viên",
    "Your current membership status and benefits": "Trạng thái thành viên và quyền lợi hiện tại",
    "Current Status": "Trạng thái hiện tại",
    "Notification Credits": "Tín dụng thông báo",
    "Send an Invitation": "Gửi lời mời",
    "Invitee email": "Email người được mời",
    "Invitation note (optional)": "Lời nhắn (không bắt buộc)",
    "Generate Invitation": "Tạo lời mời",
    "Preferred Contact Methods": "Phương thức liên hệ ưu tiên",
    "Profile Visibility": "Hiển thị hồ sơ",
    "Trusted Relationships": "Mối quan hệ đáng tin cậy",
    "Recent Cooperative Participation": "Hoạt động hợp tác gần đây",
    "Idea Pipeline": "Lộ trình ý tưởng",
    "My Contributions": "Đóng góp của tôi",
    "Learning History": "Lịch sử học tập",
    "Language workspace": "Không gian đa ngôn ngữ",
    "Accept Invitation": "Chấp nhận lời mời",
    "Access available according to your membership status.": "Quyền truy cập tùy theo tư cách thành viên của bạn.",
    "Activity Status": "Trạng thái hoạt động",
    "Activity data could not be loaded.": "Không thể tải dữ liệu hoạt động.",
    "Activity logged": "Đã ghi nhận hoạt động",
    "Add": "Thêm",
    "Available credits": "Tín dụng khả dụng",
    "Cancel": "Hủy",
    "Continue cooperative participation": "Tiếp tục tham gia hợp tác xã",
    "Contribution participation": "Tham gia đóng góp",
    "Control who can see your profile within the cooperative.": "Kiểm soát những người có thể xem hồ sơ của bạn trong hợp tác xã.",
    "Cooperative credits recorded for your member account": "Tín dụng hợp tác xã được ghi nhận cho tài khoản thành viên của bạn",
    "Cooperative idea lifecycle": "Vòng đời ý tưởng hợp tác",
    "Cooperative participation activity": "Hoạt động tham gia hợp tác xã",
    "Cooperative participation and operational modules": "Các mô-đun hoạt động và tham gia hợp tác xã",
    "Cooperative programs": "Các chương trình hợp tác xã",
    "Copy Invitation Link": "Sao chép liên kết lời mời",
    "Copy Invitation Message": "Sao chép nội dung lời mời",
    "Copy failed": "Sao chép không thành công",
    "Copy invitation link": "Sao chép liên kết lời mời",
    "Copy the link below to share with your invitee.": "Sao chép liên kết bên dưới để gửi cho người được mời.",
    "Create Invitation": "Tạo lời mời",
    "Created:": "Ngày tạo:",
    "Delete invitation": "Xóa lời mời",
    "Direct relationship source": "Nguồn mối quan hệ trực tiếp",
    "Done": "Hoàn tất",
    "Error": "Lỗi",
    "Expires:": "Hết hạn:",
    "Free Tier": "Gói miễn phí",
    "Full access available for paid members.": "Thành viên trả phí được sử dụng đầy đủ tính năng.",
    "IELTS": "IELTS",
    "IELTS workspace": "Không gian IELTS",
    "Image too large": "Ảnh quá lớn",
    "Invitation Link": "Liên kết lời mời",
    "Invitation Message": "Nội dung lời mời",
    "Invitation accepted": "Đã chấp nhận lời mời",
    "Invitation created": "Đã tạo lời mời",
    "Invitation deleted": "Đã xóa lời mời",
    "Invitation message copied to clipboard": "Đã sao chép lời mời vào bộ nhớ tạm",
    "Invitation message ready to personalize": "Lời mời đã sẵn sàng để cá nhân hóa",
    "Invitations you have created. Unaccepted invitations can be deleted.": "Các lời mời bạn đã tạo. Bạn có thể xóa những lời mời chưa được chấp nhận.",
    "Invite someone you personally know and trust to join the cooperative.": "Mời người bạn quen biết và tin tưởng tham gia hợp tác xã.",
    "Invited By": "Được mời bởi",
    "Invited:": "Được mời:",
    "Last active:": "Hoạt động gần nhất:",
    "Learning participation": "Tham gia học tập",
    "Link copied to clipboard": "Đã sao chép liên kết vào bộ nhớ tạm",
    "Loading credits...": "Đang tải tín dụng...",
    "Loading invitations...": "Đang tải lời mời...",
    "Loading notification credits...": "Đang tải tín dụng thông báo...",
    "Loading...": "Đang tải...",
    "Maximum of 2 contact methods reached.": "Đã đạt tối đa 2 phương thức liên hệ.",
    "Member profile available after account activation.": "Hồ sơ thành viên sẽ khả dụng sau khi kích hoạt tài khoản.",
    "Member since": "Thành viên từ",
    "Members You Have Welcomed": "Thành viên bạn đã chào đón",
    "Monthly allowance": "Hạn mức hằng tháng",
    "Multilingual": "Đa ngôn ngữ",
    "No contact methods added yet.": "Chưa thêm phương thức liên hệ nào.",
    "No credits recorded yet.": "Chưa có tín dụng nào được ghi nhận.",
    "No invitations sent yet.": "Bạn chưa gửi lời mời nào.",
    "No invitor recorded for this account.": "Tài khoản này chưa ghi nhận người mời.",
    "No members welcomed yet. Send an invitation from the Invitations tab.": "Bạn chưa mời thành viên nào. Hãy gửi lời mời trong thẻ Lời mời.",
    "No program selection limits": "Không giới hạn lựa chọn chương trình",
    "No recent cooperative participation recorded yet.": "Chưa ghi nhận hoạt động hợp tác xã gần đây.",
    "Notification-credit availability is currently unavailable.": "Hiện chưa thể kiểm tra tín dụng thông báo khả dụng.",
    "Only you and cooperative administrators can view your profile.": "Chỉ bạn và quản trị viên hợp tác xã có thể xem hồ sơ này.",
    "Paid Tier": "Gói trả phí",
    "Pending Invitation": "Lời mời đang chờ",
    "Period:": "Kỳ:",
    "Please select an image under 2 MB.": "Vui lòng chọn ảnh có dung lượng dưới 2 MB.",
    "Please try again.": "Vui lòng thử lại.",
    "Preferred Contact Platforms": "Nền tảng liên hệ ưu tiên",
    "Preparing your operational member dashboard...": "Đang chuẩn bị bảng điều khiển hoạt động thành viên...",
    "Preview": "Xem trước",
    "Priority support and features": "Hỗ trợ ưu tiên và các tính năng",
    "Program deselected": "Đã bỏ chọn chương trình",
    "Program selected": "Đã chọn chương trình",
    "Programs": "Chương trình",
    "Public Profile Preview": "Xem trước hồ sơ công khai",
    "Receive credits from all programs automatically": "Tự động nhận tín dụng từ tất cả chương trình",
    "Received": "Đã nhận",
    "Recent cooperative participation activity and continuity.": "Hoạt động tham gia hợp tác xã gần đây và tính liên tục.",
    "Recent cooperative participation could not be loaded.": "Không thể tải hoạt động hợp tác xã gần đây.",
    "Scan QR to connect. Contact details are not shown publicly.": "Quét mã QR để kết nối. Thông tin liên hệ không hiển thị công khai.",
    "Select and copy the link above manually.": "Vui lòng chọn và sao chép thủ công liên kết ở trên.",
    "Sent Invitations": "Lời mời đã gửi",
    "Share Invitation Message": "Chia sẻ nội dung lời mời",
    "Share message failed": "Không thể chia sẻ tin nhắn",
    "Status:": "Trạng thái:",
    "This is how your profile appears to other cooperative members.": "Đây là cách hồ sơ của bạn hiển thị với các thành viên khác trong hợp tác xã.",
    "This link is also saved in Sent Invitations below.": "Liên kết này cũng được lưu trong mục Lời mời đã gửi bên dưới.",
    "Unlimited programs": "Không giới hạn chương trình",
    "Unlock unlimited credit potential across all programs": "Mở khóa tiềm năng tín dụng không giới hạn trong mọi chương trình",
    "Up to two contact methods. A QR code placeholder is shown for each.": "Tối đa hai phương thức liên hệ. Mỗi phương thức có mã QR minh họa.",
    "Upgrade Now": "Nâng cấp ngay",
    "Upgrade to Paid Membership": "Nâng cấp lên tư cách thành viên trả phí",
    "Upload profile image": "Tải ảnh hồ sơ lên",
    "Visible to all cooperative members.": "Hiển thị với tất cả thành viên hợp tác xã.",
    "You have been invited to join the cooperative.": "Bạn được mời tham gia hợp tác xã.",
    "Your account is now active": "Tài khoản của bạn hiện đang hoạt động",
    "Your authoritative notification-credit allowance for the current month.": "Hạn mức tín dụng thông báo chính thức của bạn trong tháng hiện tại.",
    "Your cooperative network — the members who invited you and those you have welcomed.": "Mạng lưới hợp tác xã của bạn — những thành viên đã mời bạn và những người bạn đã chào đón.",
    "Profile avatar": "Ảnh đại diện hồ sơ",
  },
  zh: {
    "IELTS": "IELTS",
    "Welcome to Lambsbook Hub": "欢迎来到 Lambsbook Hub",
    "Please sign in to access your member dashboard.": "请登录以访问会员控制面板。",
    "Sign In": "登录",
    "Create Account": "创建账户",
    "Dashboard unavailable": "控制面板暂不可用",
    "Some operational dashboard data could not be loaded. Please refresh and try again.": "部分控制面板数据无法加载。请刷新页面后重试。",
    "Member Dashboard": "会员控制面板",
    "Member account": "会员账户",
    "Inactivity Warning": "不活跃提醒",
    "Account Inactive": "账户处于不活跃状态",
    "Stay Active": "保持活跃",
    "Reactivate Now": "立即重新激活",
    "Overview": "概览",
    "Profile": "个人资料",
    "Membership": "会员资格",
    "Credits": "积分",
    "Invitations": "邀请",
    "Relationships": "关系",
    "Workspace": "工作区",
    "Member ID": "会员编号",
    "Member Type": "会员类型",
    "Join Date": "加入日期",
    "Last Active": "最近活动",
    "Private": "私密",
    "Public": "公开",
    "Platform": "平台",
    "Handle or phone number": "用户名或电话号码",
    "Membership Overview": "会员资格概览",
    "Your current membership status and benefits": "当前会员状态与权益",
    "Current Status": "当前状态",
    "Notification Credits": "通知积分",
    "Send an Invitation": "发送邀请",
    "Invitee email": "受邀者邮箱",
    "Invitation note (optional)": "邀请留言（选填）",
    "Generate Invitation": "生成邀请",
    "Preferred Contact Methods": "首选联系方式",
    "Profile Visibility": "个人资料可见性",
    "Trusted Relationships": "可信关系",
    "Recent Cooperative Participation": "近期合作参与",
    "Idea Pipeline": "创意流程",
    "My Contributions": "我的贡献",
    "Learning History": "学习记录",
    "Language workspace": "多语言工作区",
    "Access available according to your membership status.": "可用权限取决于你的会员状态。",
    "Activity Status": "活动状态",
    "Activity data could not be loaded.": "无法加载活动数据。",
    "Activity logged": "已记录活动",
    "Add": "添加",
    "Available credits": "可用积分",
    "Cancel": "取消",
    "Continue cooperative participation": "继续参与合作社活动",
    "Contribution participation": "参与贡献",
    "Control who can see your profile within the cooperative.": "控制合作社内哪些人可以查看你的个人资料。",
    "Cooperative credits recorded for your member account": "记录在你会员账户中的合作社积分",
    "Cooperative idea lifecycle": "合作创意流程",
    "Cooperative participation activity": "合作社参与活动",
    "Cooperative participation and operational modules": "合作社参与和运营模块",
    "Cooperative programs": "合作社项目",
    "Copy Invitation Link": "复制邀请链接",
    "Copy Invitation Message": "复制邀请消息",
    "Copy failed": "复制失败",
    "Copy invitation link": "复制邀请链接",
    "Copy the link below to share with your invitee.": "复制下面的链接并分享给受邀者。",
    "Create Invitation": "创建邀请",
    "Created:": "创建时间：",
    "Delete invitation": "删除邀请",
    "Direct relationship source": "直接关系来源",
    "Done": "完成",
    "Error": "错误",
    "Expires:": "到期时间：",
    "Free Tier": "免费级别",
    "Full access available for paid members.": "付费会员可使用全部功能。",
    "IELTS workspace": "IELTS 工作区",
    "Image too large": "图片过大",
    "Invitation Link": "邀请链接",
    "Invitation Message": "邀请消息",
    "Invitation accepted": "已接受邀请",
    "Invitation created": "已创建邀请",
    "Invitation deleted": "已删除邀请",
    "Invitation message copied to clipboard": "已将邀请消息复制到剪贴板",
    "Invitation message ready to personalize": "邀请消息已准备好，可进行个性化编辑",
    "Invitations you have created. Unaccepted invitations can be deleted.": "你创建的邀请。尚未接受的邀请可以删除。",
    "Invite someone you personally know and trust to join the cooperative.": "邀请你认识且信任的人加入合作社。",
    "Invited By": "邀请人",
    "Invited:": "邀请时间：",
    "Last active:": "最近活动：",
    "Learning participation": "学习参与",
    "Link copied to clipboard": "链接已复制到剪贴板",
    "Loading credits...": "正在加载积分…",
    "Loading invitations...": "正在加载邀请…",
    "Loading notification credits...": "正在加载通知积分…",
    "Loading...": "正在加载…",
    "Maximum of 2 contact methods reached.": "已达到最多 2 种联系方式的上限。",
    "Member profile available after account activation.": "账户激活后即可查看会员资料。",
    "Member since": "会员加入时间",
    "Members You Have Welcomed": "你邀请加入的成员",
    "Monthly allowance": "每月额度",
    "Multilingual": "多语言",
    "No contact methods added yet.": "尚未添加联系方式。",
    "No credits recorded yet.": "尚无积分记录。",
    "No invitations sent yet.": "尚未发送邀请。",
    "No invitor recorded for this account.": "此账户尚无邀请人记录。",
    "No members welcomed yet. Send an invitation from the Invitations tab.": "你还没有邀请任何成员。请前往“邀请”选项卡发送邀请。",
    "No program selection limits": "项目选择数量不限",
    "No recent cooperative participation recorded yet.": "暂无近期合作社参与记录。",
    "Notification-credit availability is currently unavailable.": "目前无法查询可用通知积分。",
    "Only you and cooperative administrators can view your profile.": "只有你和合作社管理员可以查看你的个人资料。",
    "Paid Tier": "付费级别",
    "Pending Invitation": "待处理邀请",
    "Period:": "周期：",
    "Please select an image under 2 MB.": "请选择小于 2 MB 的图片。",
    "Please try again.": "请重试。",
    "Preferred Contact Platforms": "首选联系平台",
    "Preparing your operational member dashboard...": "正在准备会员运营控制面板…",
    "Preview": "预览",
    "Priority support and features": "优先支持和功能",
    "Program deselected": "已取消选择项目",
    "Program selected": "已选择项目",
    "Programs": "项目",
    "Public Profile Preview": "公开个人资料预览",
    "Receive credits from all programs automatically": "自动接收所有项目的积分",
    "Received": "收到时间：",
    "Recent cooperative participation activity and continuity.": "近期合作社参与活动及持续情况。",
    "Recent cooperative participation could not be loaded.": "无法加载近期合作社参与记录。",
    "Scan QR to connect. Contact details are not shown publicly.": "扫描二维码建立联系。联系方式不会公开显示。",
    "Select and copy the link above manually.": "请手动选择并复制上方链接。",
    "Sent Invitations": "已发送的邀请",
    "Share Invitation Message": "分享邀请消息",
    "Share message failed": "分享消息失败",
    "Status:": "状态：",
    "This is how your profile appears to other cooperative members.": "这是其他合作社成员看到的个人资料效果。",
    "This link is also saved in Sent Invitations below.": "此链接也保存在下方的“已发送邀请”中。",
    "Unlimited programs": "项目数量不限",
    "Unlock unlimited credit potential across all programs": "解锁所有项目的无限积分潜力",
    "Up to two contact methods. A QR code placeholder is shown for each.": "最多可添加两种联系方式，每种联系方式均显示二维码占位图。",
    "Upgrade Now": "立即升级",
    "Upgrade to Paid Membership": "升级为付费会员",
    "Upload profile image": "上传个人资料图片",
    "Visible to all cooperative members.": "对所有合作社成员可见。",
    "You have been invited to join the cooperative.": "你已受邀加入合作社。",
    "Your account is now active": "你的账户现已激活",
    "Your authoritative notification-credit allowance for the current month.": "你本月的正式通知积分额度。",
    "Your cooperative network — the members who invited you and those you have welcomed.": "你的合作社网络——邀请你加入的成员以及你邀请加入的成员。",
    "Profile avatar": "个人资料头像",
    "Accept Invitation": "接受邀请",
  },
};

export default function MemberHub() {
  const { toast } = useToast();
  const { language } = useLanguage();
  const dashboardText = (english: string) =>
    memberHubTranslations[language]?.[english] ?? english;
  const [activeTab, setActiveTab] = useState("overview");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [invitedEmail, setInvitedEmail] = useState("");
  const [invitationNote, setInvitationNote] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [invitationShareMessage, setInvitationShareMessage] = useState("");

  // ── APP-MEX-001A / APP-MEX-001C: Profile state with persistence ──────────
  const [profileVisibility, setProfileVisibility] = useState<"private" | "public">("private");
  const [profilePreviewOpen, setProfilePreviewOpen] = useState(false);
  // Avatar: stored as data URL for session-free persistence
  const [avatarDataUrl, setAvatarDataUrl] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  // Track whether persistence has been hydrated for the current user
  const [profileHydrated, setProfileHydrated] = useState(false);

  // ── APP-MEX-001A / APP-MEX-001C: Contact methods state (max 2) ───────────
  const [contactMethods, setContactMethods] = useState<ContactMethod[]>([]);
  const [addingContact, setAddingContact] = useState(false);
  const [newContactPlatform, setNewContactPlatform] = useState<MessengerPlatform>("WhatsApp");
  const [newContactHandle, setNewContactHandle] = useState("");

  // ── APP-MEX-001A: Sent invitations state ─────────────────────────────────
  const [deletingInvitationId, setDeletingInvitationId] = useState<string | null>(null);

  useEffect(() => {
    const token = getAuthToken();
    setIsAuthenticated(!!token);
  }, []);

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["/api/member/me"],
    queryFn: () => fetchWithAuth("/api/member/me"),
    enabled: isAuthenticated,
  });

  const {
    data: activity,
    isLoading: activityLoading,
    isError: activityError,
  } = useQuery<ActivityData>({
    queryKey: ["/api/member/recent-participation"],
    queryFn: () => fetchWithAuth("/api/member/recent-participation"),
    enabled: isAuthenticated && !profileLoading && !!profile,
  });

  const { data: earnings, isLoading: earningsLoading } = useQuery<any>({
    queryKey: ["/api/member/earnings"],
    queryFn: () => fetchWithAuth("/api/member/earnings"),
    enabled: isAuthenticated && !profileLoading && !!profile,
  });

  const {
    data: notificationCredits,
    isLoading: notificationCreditsLoading,
  } = useQuery<{
    member_id: string;
    monthly_allowance: number;
    available_credits: number;
  } | null>({
    queryKey: ["/api/member/notification-credits"],
    queryFn: () => fetchWithAuth("/api/member/notification-credits"),
    enabled: isAuthenticated && !profileLoading && !!profile,
  });

  const { data: invitationData, isLoading: invitationLoading } = useQuery<any>({
    queryKey: ["/api/member/pending-invitation"],
    queryFn: () => fetchWithAuth("/api/member/pending-invitation"),
    enabled: isAuthenticated && !profileLoading && !!profile,
  });

  const { data: relationshipsData, isLoading: relationshipsLoading } = useQuery<any>({
    queryKey: ["/api/member/trusted-relationships"],
    queryFn: () => fetchWithAuth("/api/member/trusted-relationships"),
    enabled: isAuthenticated && !profileLoading && !!profile,
  });

  // ── APP-MEX-001A: Sent invitations query ─────────────────────────────────
  const { data: sentInvitationsData, isLoading: sentInvitationsLoading } = useQuery<any>({
    queryKey: ["/api/member/invitations"],
    queryFn: () => fetchWithAuth("/api/member/invitations"),
    enabled: isAuthenticated && !profileLoading && !!profile,
  });

  // ── APP-MEX-001D: Backend profile preferences ─────────────────────────────
  const { data: backendPrefs } = useQuery<{
    avatar_reference:   string | null;
    profile_visibility: "private" | "public";
    contact_methods:    ContactMethod[];
  }>({
    queryKey: ["/api/member/profile/preferences"],
    queryFn: () => fetchWithAuth("/api/member/profile/preferences"),
    enabled: isAuthenticated && !profileLoading && !!profile,
    staleTime: 60_000,
  });

  // APP-MEX-001D — Backend-first hydration; localStorage as compatibility fallback
  useEffect(() => {
    const userId = profile?.user_id ?? profile?.id ?? null;
    if (!userId || profileHydrated) return;

    if (backendPrefs) {
      // Backend supersedes localStorage
      setProfileVisibility(backendPrefs.profile_visibility);
      setContactMethods(backendPrefs.contact_methods ?? []);
      // avatar_reference is a server-side key; avatarDataUrl is local display.
      // Keep local avatarDataUrl if backend has no reference yet.
      if (!backendPrefs.avatar_reference) {
        const local = loadLocalProfile(String(userId));
        setAvatarDataUrl(local.avatarDataUrl);
      }
      setProfileHydrated(true);
    } else {
      // Backend not yet available — fall back to localStorage
      const local = loadLocalProfile(String(userId));
      setProfileVisibility(local.visibility);
      setContactMethods(local.contactMethods);
      setAvatarDataUrl(local.avatarDataUrl);
      setProfileHydrated(true);
    }
  }, [profile, profileHydrated, backendPrefs]);

  // APP-MEX-001D — Persist to backend + localStorage on every change
  useEffect(() => {
    const userId = profile?.user_id ?? profile?.id ?? null;
    if (!userId || !profileHydrated) return;

    // localStorage fallback (always kept in sync)
    saveLocalProfile(String(userId), {
      visibility: profileVisibility,
      contactMethods,
      avatarDataUrl,
    });

    // Backend persistence (fire-and-forget; errors are non-blocking)
    putWithAuth("/api/member/profile/preferences", {
      profile_visibility: profileVisibility,
      contact_methods:    contactMethods,
      // avatar_reference not sent here; only updated when a new image is uploaded
    }).catch((err: unknown) => {
      console.warn("[APP-MEX-001D] Failed to persist profile preferences to backend:", err);
    });
  }, [profile, profileHydrated, profileVisibility, contactMethods, avatarDataUrl]);

  const isDashboardLoading = profileLoading;

  const selectProgramMutation = useMutation({
    mutationFn: (programId: string) => postWithAuth(`/api/member/programs/${programId}/select`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/member/programs"] });
      toast({ title: dashboardText("Program selected") });
    },
    onError: (error: Error) => {
      toast({ title: dashboardText("Error"), description: error.message, variant: "destructive" });
    },
  });

  const deselectProgramMutation = useMutation({
    mutationFn: (programId: string) => postWithAuth(`/api/member/programs/${programId}/deselect`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/member/programs"] });
      toast({ title: dashboardText("Program deselected") });
    },
    onError: (error: Error) => {
      toast({
        title: dashboardText("Error"),
        description: error.message,
        variant: "destructive"
      });
    },
  });

  const logActivityMutation = useMutation({
    mutationFn: () => postWithAuth("/api/member/activity/log", { activity_type: "manual_check_in" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/member/activity"] });
      queryClient.invalidateQueries({ queryKey: ["/api/member/earnings"] });
      toast({ title: dashboardText("Activity logged"), description: dashboardText("Your account is now active") });
    },
    onError: (error: Error) => {
      toast({
        title: dashboardText("Error"),
        description: error.message,
        variant: "destructive"
      });
    },
  });

  const createInvitationMutation = useMutation({
    mutationFn: () =>
      postWithAuth("/api/member/invitations", {
        invitedEmail,
        note: invitationNote.trim() || null
      }),
    onSuccess: (data:any) => {
      const link =
        data?.inviteUrl ||
        data?.invitationUrl ||
        data?.url ||
        data?.link ||
        "";

      setInviteLink(link);
      queryClient.invalidateQueries({ queryKey: ["/api/member/invitations"] });

      // D1: Do NOT auto-close — keep modal open so inviter can copy and share the link.
      toast({
        title: dashboardText("Invitation created"),
        description: dashboardText("Copy the link below to share with your invitee."),
      });
    },
    onError: (error: Error) => {
      toast({
        title: dashboardText("Error"),
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const acceptInvitationMutation = useMutation({
    mutationFn: () =>
      postWithAuth("/api/member/accept-invitation", {
        invitationId: invitationData?.invitation?.id
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/member/pending-invitation"] });
      queryClient.invalidateQueries({ queryKey: ["/api/member/me"] });
      toast({ title: dashboardText("Invitation accepted") });
    },
    onError: (error: Error) => {
      toast({
        title: dashboardText("Error"),
        description: error.message,
        variant: "destructive"
      });
    },
  });

  // ── APP-MEX-001A: Delete unaccepted invitation ────────────────────────────
  const deleteInvitationMutation = useMutation({
    mutationFn: (invitationId: string) =>
      deleteWithAuth(`/api/member/invitations/${invitationId}`),
    onSuccess: () => {
      setDeletingInvitationId(null);
      queryClient.invalidateQueries({ queryKey: ["/api/member/invitations"] });
      toast({ title: dashboardText("Invitation deleted") });
    },
    onError: (error: Error) => {
      setDeletingInvitationId(null);
      toast({ title: dashboardText("Error"), description: error.message, variant: "destructive" });
    },
  });

  // ── APP-MEX-001A: Contact method handlers ─────────────────────────────────

  // APP-MEX-001C — Avatar upload handler
  const handleAvatarUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      // Enforce reasonable size limit (2 MB) to stay within localStorage budget
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: dashboardText("Image too large"),
          description: dashboardText("Please select an image under 2 MB."),
          variant: "destructive",
        });
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result;
        if (typeof result === "string") {
          setAvatarDataUrl(result);
        }
      };
      reader.readAsDataURL(file);
      // Reset input so the same file can be re-selected if needed
      e.target.value = "";
    },
    [toast]
  );

  function handleAddContact() {
    if (!newContactHandle.trim()) return;
    if (contactMethods.length >= 2) return;
    const next: ContactMethod = {
      id: `cm-${Date.now()}`,
      platform: newContactPlatform,
      handle: newContactHandle.trim(),
    };
    setContactMethods((prev) => [...prev, next]);
    setNewContactHandle("");
    setNewContactPlatform("WhatsApp");
    setAddingContact(false);
  }

  function handleRemoveContact(id: string) {
    setContactMethods((prev) => prev.filter((c) => c.id !== id));
  }

  // ── Sent invitations from query or empty array ────────────────────────────
  const sentInvitations: SentInvitation[] =
    (sentInvitationsData?.invitations ?? sentInvitationsData ?? []) as SentInvitation[];

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card className="text-center py-12">
          <CardContent>
            <User className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">{dashboardText("Welcome to Lambsbook Hub")}</h2>
            <p className="text-muted-foreground mb-6">{dashboardText("Please sign in to access your member dashboard.")}</p>
            <div className="flex justify-center gap-4">
              <Link href="/hub/login">
                <Button data-testid="button-login">{dashboardText("Sign In")}</Button>
              </Link>
              <Link href="/hub/signup">
                <Button variant="outline" data-testid="button-signup">{dashboardText("Create Account")}</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isDashboardLoading) {
    return (
      <div className="container mx-auto p-6 max-w-5xl">
        <div className="text-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">
            {dashboardText("Preparing your operational member dashboard...")}
          </p>
        </div>
      </div>
    );
  }

  console.log("MEMBERHUB_READINESS", {
    hasProfile: !!profile,
    memberId: profile?.id ?? null,
    userId: profile?.user_id ?? null,
    role: profile?.role ?? null,
    isSuperAdmin: profile?.is_super_admin ?? null,
    profile,
  });

  if (
    !profile ||
    false
  ) {
    return (
      <div className="container mx-auto p-6 max-w-5xl space-y-4">

        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{dashboardText("Dashboard unavailable")}</AlertTitle>
          <AlertDescription>
            {dashboardText("Some operational dashboard data could not be loaded. Please refresh and try again.")}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (profile?.is_super_admin || profile?.role === "admin") {
    return <HubAdminDashboard />;
  }

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="flex justify-end mb-4">
        <LanguageSwitcher />
      </div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">{dashboardText("Member Dashboard")}</h1>
          <p className="text-muted-foreground">
            {profile?.email || "Member account"}
          </p>
        </div>
        <Badge 
          variant={profile?.membership_status === "paid" ? "default" : "secondary"}
          className="text-sm"
        >
          {profile?.membership_status === "paid" ? "Paid Member" : "Free Member"}
        </Badge>
      </div>

      {activity?.warning && (
        <Alert variant="destructive" className="mb-6" data-testid="alert-inactivity-warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{dashboardText("Inactivity Warning")}</AlertTitle>
          <AlertDescription>
            {activity.warning.message} {activity.warning.consequence}
            <Button 
              size="sm" 
              className="ml-4" 
              onClick={() => logActivityMutation.mutate()}
              disabled={logActivityMutation.isPending}
              data-testid="button-reactivate"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${logActivityMutation.isPending ? 'animate-spin' : ''}`} />
              {dashboardText("Stay Active")}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {activity?.reactivation && (
        <Alert variant="destructive" className="mb-6" data-testid="alert-inactive-account">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{dashboardText("Account Inactive")}</AlertTitle>
          <AlertDescription>
            {activity.reactivation.message} {activity.reactivation.consequence}
            <Button 
              size="sm" 
              className="ml-4" 
              onClick={() => logActivityMutation.mutate()}
              disabled={logActivityMutation.isPending}
              data-testid="button-reactivate-account"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${logActivityMutation.isPending ? 'animate-spin' : ''}`} />
              {dashboardText("Reactivate Now")}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-7 w-full" data-testid="tabs-member">
          <TabsTrigger value="overview" data-testid="tab-overview">{dashboardText("Overview")}</TabsTrigger>
          <TabsTrigger value="profile" data-testid="tab-profile">{dashboardText("Profile")}</TabsTrigger>
          <TabsTrigger value="membership" data-testid="tab-membership">{dashboardText("Membership")}</TabsTrigger>
          <TabsTrigger value="earnings" data-testid="tab-earnings">{dashboardText("Credits")}</TabsTrigger>
          <TabsTrigger value="invitations" data-testid="tab-invitations">{dashboardText("Invitations")}</TabsTrigger>
          <TabsTrigger value="relationships" data-testid="tab-relationships">{dashboardText("Relationships")}</TabsTrigger>
          <TabsTrigger value="workspace" data-testid="tab-workspace">{dashboardText("Workspace")}</TabsTrigger>
        </TabsList>

        {/* ================================================================
            PROFILE TAB — APP-MEX-001A
            Consumes authenticated identity only.
            No authentication, role resolution, or routing here.
        ================================================================ */}
        <TabsContent value="profile" className="space-y-4" data-testid="tab-content-profile">

          {/* ── 1. Identity card with Profile Image placeholder ─────────── */}
          <Card data-testid="card-member-identity">
            <CardHeader>
              <div className="flex items-center gap-4">

                {/* Profile image placeholder — APP-MEX-001A */}
                <div className="relative shrink-0" data-testid="profile-image-container">
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center border-2 border-muted overflow-hidden">
                    {avatarDataUrl ? (
                      <img
                        src={avatarDataUrl}
                        alt={dashboardText("Profile avatar")}
                        className="h-full w-full object-cover"
                        data-testid="img-avatar"
                      />
                    ) : (
                      <User className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  {/* Hidden file input — APP-MEX-001C */}
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    aria-hidden="true"
                    onChange={handleAvatarUpload}
                    data-testid="input-avatar-file"
                  />
                  <button
                    type="button"
                    className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-primary flex items-center justify-center border-2 border-background"
                    aria-label={dashboardText("Upload profile image")}
                    data-testid="button-upload-avatar"
                    onClick={() => avatarInputRef.current?.click()}
                  >
                    <Camera className="h-3 w-3 text-primary-foreground" />
                  </button>
                </div>

                <div className="min-w-0 flex-1">
                  <CardTitle className="text-lg truncate">
                    {profile?.email ?? "Member account"}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Badge
                      variant={profile?.membership_status === "paid" ? "default" : "secondary"}
                      className="text-xs"
                      data-testid="badge-membership-status"
                    >
                      {profile?.membership_status === "paid" ? "Paid Member" : "Free Member"}
                    </Badge>
                    <Badge
                      variant={activity?.activity_status === "active" ? "outline" : "secondary"}
                      className="text-xs"
                      data-testid="badge-activity-status"
                    >
                      {activity?.activity_status ?? "Active"}
                    </Badge>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg border bg-muted/30 px-3 py-2">
                  <div className="text-xs text-muted-foreground mb-1">{dashboardText("Member ID")}</div>
                  <div className="font-mono text-xs truncate" data-testid="text-member-id">
                    {profile?.id ?? "—"}
                  </div>
                </div>
                <div className="rounded-lg border bg-muted/30 px-3 py-2">
                  <div className="text-xs text-muted-foreground mb-1">{dashboardText("Member Type")}</div>
                  <div className="text-sm capitalize" data-testid="text-member-type">
                    {profile?.member_type ?? "—"}
                  </div>
                </div>
                <div className="rounded-lg border bg-muted/30 px-3 py-2">
                  <div className="text-xs text-muted-foreground mb-1">{dashboardText("Join Date")}</div>
                  <div className="text-sm" data-testid="text-join-date">
                    {profile?.join_date
                      ? new Date(profile.join_date).toLocaleDateString()
                      : "—"}
                  </div>
                </div>
                <div className="rounded-lg border bg-muted/30 px-3 py-2">
                  <div className="text-xs text-muted-foreground mb-1">{dashboardText("Last Active")}</div>
                  <div className="text-sm" data-testid="text-last-active">
                    {activity?.last_activity_at
                      ? new Date(activity.last_activity_at).toLocaleDateString()
                      : "Recently"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ── 2. Profile Visibility — functional switch ───────────────── */}
          <Card data-testid="card-profile-visibility">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Shield className="h-4 w-4" />
                  {dashboardText("Profile Visibility")}
                </CardTitle>
                {profileVisibility === "public" && (
                  <Button
                    variant="outline"
                    onClick={() => setProfilePreviewOpen(true)}
                    data-testid="button-preview-public-profile"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    {dashboardText("Preview")}
                  </Button>
                )}
              </div>
              <CardDescription>
                {dashboardText("Control who can see your profile within the cooperative.")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">

              {/* Private option */}
              <button
                type="button"
                className={`w-full flex items-center gap-3 rounded-lg border-2 px-4 py-3 text-left transition-colors ${
                  profileVisibility === "private"
                    ? "border-primary bg-primary/5"
                    : "border-muted bg-transparent hover:bg-muted/30"
                }`}
                aria-pressed={profileVisibility === "private"}
                data-testid="button-visibility-private"
                onClick={() => setProfileVisibility("private")}
              >
                <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                  profileVisibility === "private" ? "bg-primary/10" : "bg-muted"
                }`}>
                  <EyeOff className={`h-4 w-4 ${
                    profileVisibility === "private" ? "text-primary" : "text-muted-foreground"
                  }`} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-foreground">{dashboardText("Private")}</div>
                  <div className="text-xs text-muted-foreground">
                    {dashboardText("Only you and cooperative administrators can view your profile.")}
                  </div>
                </div>
                {profileVisibility === "private" && (
                  <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                )}
              </button>

              {/* Public option — now functional */}
              <button
                type="button"
                className={`w-full flex items-center gap-3 rounded-lg border-2 px-4 py-3 text-left transition-colors ${
                  profileVisibility === "public"
                    ? "border-primary bg-primary/5"
                    : "border-muted bg-transparent hover:bg-muted/30"
                }`}
                aria-pressed={profileVisibility === "public"}
                data-testid="button-visibility-public"
                onClick={() => setProfileVisibility("public")}
              >
                <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                  profileVisibility === "public" ? "bg-primary/10" : "bg-muted"
                }`}>
                  <Eye className={`h-4 w-4 ${
                    profileVisibility === "public" ? "text-primary" : "text-muted-foreground"
                  }`} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-foreground">{dashboardText("Public")}</div>
                  <div className="text-xs text-muted-foreground">
                    {dashboardText("Visible to all cooperative members.")}
                  </div>
                </div>
                {profileVisibility === "public" && (
                  <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                )}
              </button>

            </CardContent>
          </Card>

          {/* ── 3. Public Profile preview modal ────────────────────────── */}
          <Dialog open={profilePreviewOpen} onOpenChange={setProfilePreviewOpen}>
            <DialogContent data-testid="dialog-public-profile-preview">
              <div className="space-y-4">
                <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  {dashboardText("Public Profile Preview")}
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                    {avatarDataUrl ? (
                      <img
                        src={avatarDataUrl}
                        alt={dashboardText("Profile avatar")}
                        className="h-full w-full object-cover"
                        data-testid="img-preview-avatar"
                      />
                    ) : (
                      <User className="h-7 w-7 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <div className="font-semibold">{profile?.email ?? "Member"}</div>
                    <div className="text-xs text-muted-foreground capitalize">
                      {profile?.member_type ?? "Member"}
                    </div>
                  </div>
                </div>
                {contactMethods.length > 0 && (
                  <div className="space-y-3">
                    <div className="text-xs font-medium text-muted-foreground">
                      {dashboardText("Preferred Contact Platforms")}
                    </div>
                    {/* APP-MEX-001B: platform label + QR only — no phone numbers or messenger IDs */}
                    <div className="flex gap-3 flex-wrap">
                      {contactMethods.map((cm) => (
                        <div
                          key={cm.id}
                          className="flex flex-col items-center gap-1"
                          data-testid={`preview-contact-${cm.id}`}
                        >
                          <div className="flex flex-col items-center justify-center w-20 h-20 rounded-lg border border-dashed border-muted bg-muted/20">
                            <QrCode className="h-5 w-5 text-muted-foreground mb-1" />
                            <span className="text-[10px] text-muted-foreground text-center leading-tight px-1">
                              {cm.platform}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {dashboardText("Scan QR to connect. Contact details are not shown publicly.")}
                    </div>
                  </div>
                )}
                <div className="text-xs text-muted-foreground border-t pt-3">
                  {dashboardText("This is how your profile appears to other cooperative members.")}
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* ── 4. Preferred Contact Methods — max 2, messenger type, QR ── */}
          <Card data-testid="card-preferred-contact-methods">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Phone className="h-4 w-4" />
                  {dashboardText("Preferred Contact Methods")}
                </CardTitle>
                {contactMethods.length < 2 && !addingContact && (
                  <Button
                    variant="outline"
                    onClick={() => setAddingContact(true)}
                    data-testid="button-add-contact-method"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    {dashboardText("Add")}
                  </Button>
                )}
              </div>
              <CardDescription>
                {dashboardText("Up to two contact methods. A QR code placeholder is shown for each.")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">

              {contactMethods.length === 0 && !addingContact && (
                <div className="text-sm text-muted-foreground" data-testid="text-no-contact-methods">
                  {dashboardText("No contact methods added yet.")}
                </div>
              )}

              {contactMethods.map((cm) => (
                <div
                  key={cm.id}
                  className="flex items-center gap-4 border rounded-lg p-3"
                  data-testid={`contact-method-${cm.id}`}
                >
                  <QrPlaceholder platform={cm.platform} handle={cm.handle} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold">{cm.platform}</div>
                    <div className="text-xs text-muted-foreground truncate">{cm.handle}</div>
                  </div>
                  <button
                    type="button"
                    className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                    aria-label={`Remove ${cm.platform} contact method`}
                    data-testid={`button-remove-contact-${cm.id}`}
                    onClick={() => handleRemoveContact(cm.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}

              {addingContact && (
                <div className="border rounded-lg p-4 space-y-3 bg-muted/20" data-testid="form-add-contact">
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground">{dashboardText("Platform")}</div>
                    <select
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                      value={newContactPlatform}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewContactPlatform(e.target.value as MessengerPlatform)}
                      data-testid="select-contact-platform"
                    >
                      {MESSENGER_PLATFORMS.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground">{dashboardText("Handle or phone number")}</div>
                    <Input
                      placeholder={`Your ${newContactPlatform} handle`}
                      value={newContactHandle}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewContactHandle(e.target.value)}
                      data-testid="input-contact-handle"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleAddContact}
                      disabled={!newContactHandle.trim()}
                      data-testid="button-confirm-add-contact"
                    >
                      {dashboardText("Add")}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setAddingContact(false);
                        setNewContactHandle("");
                        setNewContactPlatform("WhatsApp");
                      }}
                      data-testid="button-cancel-add-contact"
                    >
                      {dashboardText("Cancel")}
                    </Button>
                  </div>
                </div>
              )}

              {contactMethods.length >= 2 && (
                <div className="text-xs text-muted-foreground" data-testid="text-max-contacts-reached">
                  {dashboardText("Maximum of 2 contact methods reached.")}
                </div>
              )}
            </CardContent>
          </Card>

        </TabsContent>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card data-testid="stat-card-membership">
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <CardTitle className="text-sm font-medium">{dashboardText("Membership")}</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold capitalize">{profile?.membership_status || "Free"}</div>
                <p className="text-xs text-muted-foreground">
                  {profile?.membership_status === "paid" ? "Unlimited program access" : "2 programs"}
                </p>
              </CardContent>
            </Card>

            <Card data-testid="stat-card-activity">
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <CardTitle className="text-sm font-medium">{dashboardText("Activity Status")}</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {activityLoading ? (
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-3 w-3 animate-spin text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{dashboardText("Loading...")}</span>
                  </div>
                ) : activityError ? (
                  <div className="text-sm text-destructive">
                    {dashboardText("Activity data could not be loaded.")}
                  </div>
                ) : (
                  <>
                    <div className="text-2xl font-bold capitalize">{activity?.activity_status || "Active"}</div>
                    <p className="text-xs text-muted-foreground">
                      {dashboardText("Last active:")} {activity?.last_activity_at ? new Date(activity.last_activity_at).toLocaleDateString() : "Recently"}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="md:col-span-2" data-testid="card-recent-participation">
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <CardTitle>{dashboardText("Recent Cooperative Participation")}</CardTitle>

                  <div className="text-[10px] px-2 py-1 rounded-full border text-muted-foreground">
                    {activity?.recent_logs?.length
                      ? "Participation active"
                      : "Participation pending"}
                  </div>
                </div>
                <CardDescription>
                  {dashboardText("Recent cooperative participation activity and continuity.")}
                </CardDescription>

                <div className="px-6 pb-2 space-y-1">
                  <div className="text-xs text-muted-foreground">
                    {activity?.recent_logs?.length
                      ? "Cooperative participation continuity remains active."
                      : "Participation continuity will appear as cooperative activity grows."}
                  </div>

                  <div className="text-xs text-muted-foreground">
                    {activity?.recent_logs?.length
                      ? "Your recent cooperative participation history continues to grow."
                      : "Cooperative participation summaries will appear as engagement develops."}
                  </div>

                  <div className="pt-2">
                    <button
                      className="text-xs border rounded-md px-3 py-1 hover:bg-muted transition-colors"
                      type="button"
                    >
                      {dashboardText("Continue cooperative participation")}
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                {activityError ? (
                  <div className="text-sm text-destructive">
                    {dashboardText("Recent cooperative participation could not be loaded.")}
                  </div>
                ) : activity?.recent_logs?.length ? (
                  <div className="space-y-4">
                    {activity.recent_logs.slice(0, 5).map((log) => (
                      <div
                        key={log.id}
                        className="flex items-center justify-between border rounded-lg px-3 py-2 transition-colors hover:bg-muted/40"
                      >
                        <div>
                          <div className="font-medium capitalize">
                            {log.activity_type === "manual_check_in"
                              ? "Manual participation check-in"
                              : log.activity_type.replaceAll("_", " ")}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {dashboardText("Cooperative participation activity")}
                          </div>
                        </div>

                        <div className="text-xs text-muted-foreground">
                          {(() => {
                            const now = new Date();
                            const created = new Date(log.created_at);

                            const diffMs = now.getTime() - created.getTime();
                            const diffDays = Math.floor(
                              diffMs / (1000 * 60 * 60 * 24)
                            );

                            if (diffDays <= 0) return "Today";
                            if (diffDays === 1) return "Yesterday";
                            if (diffDays < 7) return `${diffDays} days ago`;

                            return created.toLocaleDateString();
                          })()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    {dashboardText("No recent cooperative participation recorded yet.")}
                  </div>
                )}
              </CardContent>
            </Card>          </div>

          {profile?.membership_status === "free" && (
            <Card className="bg-gradient-to-r from-primary/10 to-primary/5" data-testid="card-upgrade-cta">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowUpCircle className="h-5 w-5" />
                  {dashboardText("Upgrade to Paid Membership")}
                </CardTitle>
                <CardDescription>{dashboardText("Unlock unlimited credit potential across all programs")}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    {dashboardText("Receive credits from all programs automatically")}
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    {dashboardText("No program selection limits")}
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    {dashboardText("Priority support and features")}
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button data-testid="button-upgrade">{dashboardText("Upgrade Now")}</Button>
              </CardFooter>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="membership" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{dashboardText("Membership Overview")}</CardTitle>
              <CardDescription>{dashboardText("Your current membership status and benefits")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium">{dashboardText("Current Status")}</div>
                  <div className="text-sm text-muted-foreground">
                    {profile?.membership_status === "paid" 
                      ? "You have full access to all programs and features"
                      : "Free tier with limited program access"}
                  </div>
                </div>
                <Badge variant={profile?.membership_status === "paid" ? "default" : "secondary"} className="text-lg px-4 py-2">
                  {profile?.membership_status === "paid" ? "PAID" : "FREE"}
                </Badge>
              </div>



              <Card data-testid="card-notification-credits">
                <CardHeader>
                  <CardTitle className="text-lg">{dashboardText("Notification Credits")}</CardTitle>
                  <CardDescription>
                    {dashboardText("Your authoritative notification-credit allowance for the current month.")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {notificationCreditsLoading ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      {dashboardText("Loading notification credits...")}
                    </div>
                  ) : notificationCredits ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-lg border p-3">
                        <div className="text-sm text-muted-foreground">
                          {dashboardText("Monthly allowance")}
                        </div>
                        <div
                          className="text-2xl font-semibold"
                          data-testid="text-monthly-notification-credits"
                        >
                          {notificationCredits.monthly_allowance}
                        </div>
                      </div>
                      <div className="rounded-lg border p-3">
                        <div className="text-sm text-muted-foreground">
                          {dashboardText("Available credits")}
                        </div>
                        <div
                          className="text-2xl font-semibold"
                          data-testid="text-available-notification-credits"
                        >
                          {notificationCredits.available_credits}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      {dashboardText("Notification-credit availability is currently unavailable.")}
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-4 pt-4">
                <Card className={profile?.membership_status === "free" ? "border-primary" : ""}>
                  <CardHeader>
                    <CardTitle className="text-lg">{dashboardText("Free Tier")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      {dashboardText("Access available according to your membership status.")}
                    </p>
                  </CardContent>
                </Card>
                <Card className={profile?.membership_status === "paid" ? "border-primary" : ""}>
                  <CardHeader>
                    <CardTitle className="text-lg">{dashboardText("Paid Tier")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      {dashboardText("Full access available for paid members.")}
                    </p>
                    <div className="mt-4">
                      <Badge>{dashboardText("Unlimited programs")}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div></CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="earnings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{dashboardText("Credits")}</CardTitle>
              <CardDescription>
                {dashboardText("Cooperative credits recorded for your member account")}
              </CardDescription>
            </CardHeader>

            <CardContent>
              {earningsLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  {dashboardText("Loading credits...")}
                </div>
              ) : !earnings?.length ? (
                <div className="text-sm text-muted-foreground">
                  {dashboardText("No credits recorded yet.")}
                </div>
              ) : (
                <div className="space-y-3">
                  {earnings.map((earning: any) => (
                    <div
                      key={earning.id}
                      className="flex items-center justify-between border rounded-lg p-3"
                    >
                      <div>
                        <div className="font-medium">
                          $ {earning.amount}
                        </div>

                        <div className="text-xs text-muted-foreground">
                          {dashboardText("Status:")} {earning.earning_status}
                        </div>

                        <div className="text-xs text-muted-foreground">
                          {dashboardText("Period:")} {earning.period}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ================================================================
            INVITATIONS TAB — APP-MEX-001A
            Invitation Relationship Workspace: email, created, expiry,
            notes, delete unaccepted.
        ================================================================ */}
        <TabsContent value="invitations" className="space-y-4">

          {/* Generate invitation card */}
          <Card>
            <CardHeader>
              <CardTitle>{dashboardText("Send an Invitation")}</CardTitle>
              <CardDescription>
                {dashboardText("Invite someone you personally know and trust to join the cooperative.")}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Button
                onClick={() => setInviteModalOpen(true)}
                data-testid="button-open-invite-modal"
              >
                {dashboardText("Generate Invitation")}
              </Button>

              <Dialog
                open={inviteModalOpen}
                onOpenChange={(open) => {
                  setInviteModalOpen(open);
                  if (!open) {
                    setInviteLink("");
                    setInvitedEmail("");
                    setInvitationNote("");
                  }
                }}
              >
                <DialogContent>
                  <div className="space-y-4">

                    <Input
                      type="email"
                      value={invitedEmail}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInvitedEmail(e.target.value)}
                      placeholder={dashboardText("Invitee email")}
                      data-testid="input-invited-email"
                    />

                    <textarea
                      value={invitationNote}
                      onChange={(e) => setInvitationNote(e.target.value)}
                      placeholder={dashboardText("Invitation note (optional)")}
                      rows={3}
                      className="flex min-h-[80px] w-full rounded-md border bg-background px-3 py-2 text-sm"
                      data-testid="input-invitation-note"
                    />

                    <Button
                      onClick={() => createInvitationMutation.mutate()}
                      disabled={createInvitationMutation.isPending}
                      data-testid="button-create-invitation"
                    >
                      {dashboardText("Create Invitation")}
                    </Button>

                    {inviteLink ? (
                      <div className="space-y-3 pt-2">
                        <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
                          <div className="text-xs font-semibold text-foreground">{dashboardText("Invitation Link")}</div>
                          <div className="text-xs break-all text-muted-foreground font-mono select-all">
                            {inviteLink}
                          </div>
                        </div>
                        <Button
                          className="w-full"
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(inviteLink);
                              toast({ title: dashboardText("Link copied to clipboard") });
                            } catch {
                              toast({ title: dashboardText("Copy failed"), description: dashboardText("Select and copy the link above manually."), variant: "destructive" });
                            }
                          }}
                          data-testid="button-copy-invite-link"
                        >
                          {dashboardText("Copy Invitation Link")}
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full"
                          disabled={!inviteLink}
                          onClick={async () => {
                            try {
                              const data = await postWithAuth("/api/member/invitations/share", {
                                invitationLink: inviteLink,
                                language,
                              });
                              setInvitationShareMessage(data.message);
                              toast({ title: dashboardText("Invitation message ready to personalize") });
                            } catch {
                              toast({ title: dashboardText("Share message failed"), description: dashboardText("Please try again."), variant: "destructive" });
                            }
                          }}
                          data-testid="button-share-invitation-message"
                        >
                          {dashboardText("Share Invitation Message")}
                        </Button>
                        {invitationShareMessage ? (
                          <div className="space-y-2">
                            <label
                              htmlFor="invitation-share-message"
                              className="text-sm font-medium"
                            >
                              {dashboardText("Invitation Message")}
                            </label>
                            <textarea
                              id="invitation-share-message"
                              value={invitationShareMessage}
                              onChange={(event) => setInvitationShareMessage(event.target.value)}
                              className="min-h-40 w-full rounded-md border bg-background px-3 py-2 text-sm"
                              data-testid="textarea-invitation-share-message"
                            />
                            <Button
                              variant="outline"
                              className="w-full"
                              onClick={async () => {
                                try {
                                  await navigator.clipboard.writeText(invitationShareMessage);
                                  toast({ title: dashboardText("Invitation message copied to clipboard") });
                                } catch {
                                  toast({ title: dashboardText("Copy failed"), description: dashboardText("Please try again."), variant: "destructive" });
                                }
                              }}
                              data-testid="button-copy-personalized-invitation-message"
                            >
                              {dashboardText("Copy Invitation Message")}
                            </Button>
                          </div>
                        ) : null}
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => {
                            setInviteModalOpen(false);
                            setInviteLink("");
                            setInvitedEmail("");
                            setInvitationNote("");
                            setInvitationShareMessage("");
                          }}
                          data-testid="button-close-invite-modal"
                        >
                          {dashboardText("Done")}
                        </Button>
                        <p className="text-[11px] text-muted-foreground text-center">
                          {dashboardText("This link is also saved in Sent Invitations below.")}
                        </p>
                      </div>
                    ) : null}

                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Pending received invitation card — APP-MEX-001B: no UUID exposure */}
          {invitationData?.has_pending_invitation && (
            <Card data-testid="card-pending-invitation">
              <CardHeader>
                <CardTitle>{dashboardText("Pending Invitation")}</CardTitle>
                <CardDescription>{dashboardText("You have been invited to join the cooperative.")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-4 space-y-2">
                  {invitationData?.invitation?.invited_email && (
                    <div className="text-sm">
                      <span className="font-medium">{dashboardText("Invited:")} </span>
                      <span className="text-muted-foreground" data-testid="pending-invited-email">
                        {invitationData.invitation.invited_email}
                      </span>
                    </div>
                  )}
                  <div className="text-sm">
                    <span className="font-medium">{dashboardText("Status:")} </span>
                    <Badge variant="outline" className="text-xs" data-testid="pending-invitation-status">
                      {invitationData?.invitation?.status ?? "pending"}
                    </Badge>
                  </div>
                  {invitationData?.invitation?.created_at && (
                    <div className="text-xs text-muted-foreground" data-testid="pending-invitation-created">
                      {dashboardText("Received")} {new Date(invitationData.invitation.created_at).toLocaleDateString()}
                    </div>
                  )}

                  <Button
                    className="mt-2"
                    onClick={() => acceptInvitationMutation.mutate()}
                    disabled={acceptInvitationMutation.isPending}
                    data-testid="button-accept-invitation"
                  >
                    {dashboardText("Accept Invitation")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── APP-MEX-001A: Sent Invitations Workspace ─────────────────── */}
          <Card data-testid="card-sent-invitations">
            <CardHeader>
              <CardTitle>{dashboardText("Sent Invitations")}</CardTitle>
              <CardDescription>
                {dashboardText("Invitations you have created. Unaccepted invitations can be deleted.")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sentInvitationsLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  {dashboardText("Loading invitations...")}
                </div>
              ) : sentInvitations.length === 0 ? (
                <div className="text-sm text-muted-foreground" data-testid="text-no-sent-invitations">
                  {dashboardText("No invitations sent yet.")}
                </div>
              ) : (
                <div className="space-y-3">
                  {sentInvitations.map((inv) => {
                    const isPending =
                      inv.status === "pending" || inv.status === null || inv.status === undefined;
                    const isDeleting = deletingInvitationId === inv.id;

                    return (
                      <div
                        key={inv.id}
                        className="border rounded-lg p-4 space-y-2"
                        data-testid={`invitation-row-${inv.id}`}
                      >
                        {/* Email + D2: copy-link access */}
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium" data-testid={`invitation-email-${inv.id}`}>
                              {inv.invited_email ?? "—"}
                            </div>
                            <Badge
                              variant={
                                inv.status === "accepted"
                                  ? "default"
                                  : inv.status === "expired"
                                  ? "secondary"
                                  : "outline"
                              }
                              className="text-[10px] mt-1"
                              data-testid={`invitation-status-${inv.id}`}
                            >
                              {inv.status ?? "pending"}
                            </Badge>
                            {inv.note && (
                              <div
                                className="text-xs text-muted-foreground mt-2 whitespace-pre-wrap"
                                data-testid={`invitation-note-${inv.id}`}
                              >
                                {inv.note}
                              </div>
                            )}
                          </div>

                          {/* D2: Copy link + Delete — only for unaccepted */}
                          <div className="flex items-center gap-2 shrink-0">
                            {inv.invitation_url && (
                              <button
                                type="button"
                                className="text-muted-foreground hover:text-primary transition-colors"
                                aria-label={dashboardText("Copy invitation link")}
                                data-testid={`button-copy-invitation-link-${inv.id}`}
                                onClick={async () => {
                                  try {
                                    await navigator.clipboard.writeText(inv.invitation_url!);
                                    toast({ title: dashboardText("Link copied to clipboard") });
                                  } catch {
                                    toast({ title: dashboardText("Copy failed"), variant: "destructive" });
                                  }
                                }}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                                </svg>
                              </button>
                            )}
                            {isPending && (
                              <button
                                type="button"
                                className="text-muted-foreground hover:text-destructive transition-colors"
                                aria-label={dashboardText("Delete invitation")}
                                data-testid={`button-delete-invitation-${inv.id}`}
                                disabled={isDeleting || deleteInvitationMutation.isPending}
                                onClick={() => {
                                  setDeletingInvitationId(inv.id);
                                  deleteInvitationMutation.mutate(inv.id);
                                }}
                              >
                                {isDeleting ? (
                                  <RefreshCw className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Created date */}
                        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                          <div>
                            <span className="font-medium text-foreground">{dashboardText("Created:")} </span>
                            <span data-testid={`invitation-created-${inv.id}`}>
                              {inv.created_at
                                ? new Date(inv.created_at).toLocaleDateString()
                                : "—"}
                            </span>
                          </div>

                          {/* Expiry date */}
                          <div>
                            <span className="font-medium text-foreground">{dashboardText("Expires:")} </span>
                            <span data-testid={`invitation-expires-${inv.id}`}>
                              {inv.expires_at
                                ? new Date(inv.expires_at).toLocaleDateString()
                                : "—"}
                            </span>
                          </div>
                        </div>

                        {/* Notes */}

                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

        </TabsContent>

        <TabsContent value="relationships" className="space-y-4">
          {/* ================================================================
              RELATIONSHIPS TAB — APP-MEX-001B
              Business entities only. UUIDs must never appear in Founder UI.
              Consumes /api/member/trusted-relationships defensively.
          ================================================================ */}
          <Card data-testid="card-trusted-relationships">
            <CardHeader>
              <CardTitle>{dashboardText("Trusted Relationships")}</CardTitle>
              <CardDescription>
                {dashboardText("Your cooperative network — the members who invited you and those you have welcomed.")}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">

              {/* ── Invitor ───────────────────────────────────────────────── */}
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  {dashboardText("Invited By")}
                </div>
                {!relationshipsData?.invitor ? (
                  <div className="rounded-lg border bg-muted/20 px-4 py-3 text-sm text-muted-foreground" data-testid="text-no-invitor">
                    {dashboardText("No invitor recorded for this account.")}
                  </div>
                ) : (
                  <div className="rounded-lg border px-4 py-3 space-y-1" data-testid="card-invitor">
                    <div className="text-sm font-medium" data-testid="invitor-member-type">
                      {relationshipsData.invitor.member_type
                        ? `${String(relationshipsData.invitor.member_type).charAt(0).toUpperCase()}${String(relationshipsData.invitor.member_type).slice(1)} member`
                        : "Cooperative member"}
                    </div>
                    {relationshipsData.invitor.email && (
                      <div className="text-xs text-muted-foreground" data-testid="invitor-email">
                        {relationshipsData.invitor.email}
                      </div>
                    )}
                    {relationshipsData.invitor.join_date && (
                      <div className="text-xs text-muted-foreground">
                        {dashboardText("Member since")} {new Date(relationshipsData.invitor.join_date).toLocaleDateString()}
                      </div>
                    )}
                    {/* D7: Invitation metadata for this relationship */}
                    {(relationshipsData.invitor as any).invitation_created_at && (
                      <div className="text-xs text-muted-foreground border-t pt-1 mt-1 space-y-0.5">
                        <div><span className="font-medium text-foreground">{dashboardText("Invited:")} </span>
                          {new Date((relationshipsData.invitor as any).invitation_created_at).toLocaleDateString()}
                        </div>
                        {(relationshipsData.invitor as any).invitation_status && (
                          <div><span className="font-medium text-foreground">{dashboardText("Status:")} </span>
                            {(relationshipsData.invitor as any).invitation_status}
                          </div>
                        )}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground mt-1">
                      {dashboardText("Direct relationship source")}
                    </div>
                  </div>
                )}
              </div>

              {/* ── Direct Invitees ───────────────────────────────────────── */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {dashboardText("Members You Have Welcomed")}
                  </div>
                  <Badge variant="outline" className="text-xs" data-testid="invitee-count">
                    {relationshipsData?.invitees?.length ?? 0}
                  </Badge>
                </div>

                {!relationshipsData?.invitees?.length ? (
                  <div className="rounded-lg border bg-muted/20 px-4 py-3 text-sm text-muted-foreground" data-testid="text-no-invitees">
                    {dashboardText("No members welcomed yet. Send an invitation from the Invitations tab.")}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {(relationshipsData.invitees as any[]).map((item: any, idx: number) => {
                      // Defensive shape resolution — API may return flat or nested
                      const entity = item.invitee ?? item;
                      const memberType: string =
                        entity.member_type ?? item.member_type ?? "";
                      const email: string | null =
                        entity.email ?? item.email ?? null;
                      const joinDate: string | null =
                        entity.join_date ?? item.join_date ?? null;
                      const status: string | null =
                        item.status ?? entity.status ?? null;

                      return (
                        <div
                          key={idx}
                          className="rounded-lg border px-4 py-3 space-y-1"
                          data-testid={`invitee-row-${idx}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="text-sm font-medium" data-testid={`invitee-member-type-${idx}`}>
                              {memberType
                                ? `${memberType.charAt(0).toUpperCase()}${memberType.slice(1)} member`
                                : "Cooperative member"}
                            </div>
                            {status && (
                              <Badge
                                variant={status === "active" ? "default" : "secondary"}
                                className="text-[10px]"
                                data-testid={`invitee-status-${idx}`}
                              >
                                {status}
                              </Badge>
                            )}
                          </div>
                          {email && (
                            <div className="text-xs text-muted-foreground" data-testid={`invitee-email-${idx}`}>
                              {email}
                            </div>
                          )}
                          {joinDate && (
                            <div className="text-xs text-muted-foreground">
                              {dashboardText("Member since")} {new Date(joinDate).toLocaleDateString()}
                            </div>
                          )}
                          {/* D7: Invitation metadata for this invitee relationship */}
                          {(item as any).invitation_created_at && (
                            <div className="text-xs text-muted-foreground border-t pt-1 mt-1 space-y-0.5">
                              <div><span className="font-medium text-foreground">{dashboardText("Invited:")} </span>
                                {new Date((item as any).invitation_created_at).toLocaleDateString()}
                              </div>
                              {(item as any).invitation_status && (
                                <div><span className="font-medium text-foreground">{dashboardText("Status:")} </span>
                                  {(item as any).invitation_status}
                                </div>
                              )}
                            </div>
                          )}
                          {!email && !joinDate && !(item as any).invitation_created_at && (
                            <div className="text-xs text-muted-foreground italic" data-testid={`invitee-limited-data-${idx}`}>
                              {dashboardText("Member profile available after account activation.")}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workspace" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{dashboardText("Workspace")}</CardTitle>
              <CardDescription>
                {dashboardText("Cooperative participation and operational modules")}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">

                <a href="/hub/dashboard#pipeline" className="block border rounded-lg p-3">
                  <div className="font-medium">{dashboardText("Idea Pipeline")}</div>
                  <div className="text-xs text-muted-foreground">
                    {dashboardText("Cooperative idea lifecycle")}
                  </div>
                </a>

                <div className="border rounded-lg p-3">
                  <div className="font-medium">{dashboardText("My Contributions")}</div>
                  <div className="text-xs text-muted-foreground">
                    {dashboardText("Contribution participation")}
                  </div>
                </div>

                <div className="border rounded-lg p-3">
                  <div className="font-medium">{dashboardText("Programs")}</div>
                  <div className="text-xs text-muted-foreground">
                    {dashboardText("Cooperative programs")}
                  </div>
                </div>

                <div className="border rounded-lg p-3">
                  <div className="font-medium">{dashboardText("Learning History")}</div>
                  <div className="text-xs text-muted-foreground">
                    {dashboardText("Learning participation")}
                  </div>
                </div>

                <div className="border rounded-lg p-3">
                  <div className="font-medium">{dashboardText("IELTS")}</div>
                  <div className="text-xs text-muted-foreground">
                    {dashboardText("IELTS workspace")}
                  </div>
                </div>

                <div className="border rounded-lg p-3">
                  <div className="font-medium">{dashboardText("Multilingual")}</div>
                  <div className="text-xs text-muted-foreground">
                    {dashboardText("Language workspace")}
                  </div>
                </div>

              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
