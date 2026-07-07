from fastapi import FastAPI


app = FastAPI(title="Agent Log API")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
