flowchart TD
    U[User] --> SU[Sign Up Page]
    U --> SI[Sign In Page]
    SU --> Auth[Auth API]
    SI --> Auth
    Auth --> AD{Auth Success}
    AD -->|Yes| Dash[Dashboard]
    AD -->|No| SI
    Dash --> MM[Manage Media]
    Dash --> MA[Manage Agencies]
    Dash --> MD[Manage Advertisers]
    MM --> MediaAPI[Media API]
    MA --> AgencyAPI[Agencies API]
    MD --> AdvertiserAPI[Advertisers API]
    MediaAPI --> DB[PostgreSQL DB]
    AgencyAPI --> DB
    AdvertiserAPI --> DB
    Dash --> LO[Log Out]
    LO --> SI