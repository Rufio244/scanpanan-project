from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from engine import ScanPananEngine

app = FastAPI(title="ScanPanan Production Core", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ScanRequest(BaseModel):
    url: str
    win_rate: float

@app.get("/")
def root():
    return {"system": "ScanPanan Production Server", "status": "Active & Ready"}

@app.post("/api/scan-and-optimize")
async def scan_and_optimize(req: ScanRequest):
    try:
        engine = ScanPananEngine(req.url, req.win_rate)
        scan_result = await engine.scan_target()
        optimization_result = engine.optimize_win_rate(scan_result)
        return optimization_result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
