import React from 'react';

import ConversationWorkspace from './ConversationWorkspace';
import OrganizationBlueprint from './OrganizationBlueprint';

export default function OrganizationStudio() {
  return (
    <main
      style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '24px',
        padding: '24px',
        alignItems: 'start',
      }}
    >
      <section>
        <h1>Organization Studio</h1>
        <p>
          Design your organization through conversation and review the
          resulting blueprint before implementation.
        </p>

        <ConversationWorkspace />
      </section>

      <aside>
        <OrganizationBlueprint />
      </aside>
    </main>
  );
}
