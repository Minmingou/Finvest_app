from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    kis_app_key: str = ""
    kis_app_secret: str = ""
    kis_base_url: str = "https://openapi.koreainvestment.com:9443"

    dart_api_key: str = ""

    ai_api_key: str = ""
    ai_base_url: str = ""
    ai_model: str = ""

    database_url: str = ""

    environment: str = "development"
    use_mock_api: bool = True


settings = Settings()
