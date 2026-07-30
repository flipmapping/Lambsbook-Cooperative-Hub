from abc import ABC, abstractmethod

class AuthorityProvider(ABC):

    @abstractmethod
    def resolve(self):
        ...

class RepositoryProvider(ABC):

    @abstractmethod
    def resolve(self):
        ...

class StandardsProvider(ABC):

    @abstractmethod
    def resolve(self):
        ...
