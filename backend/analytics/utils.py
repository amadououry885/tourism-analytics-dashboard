# backend/analytics/utils.py
from datetime import datetime, timedelta
from typing import Tuple, Optional
from django.http import HttpRequest

DATE_FMT = "%Y-%m-%d"

def parse_date(s: Optional[str]) -> Optional[datetime.date]:
    if not s:
        return None
    try:
        return datetime.strptime(s, DATE_FMT).date()
    except ValueError:
        return None

def get_date_range(request: HttpRequest, default_days: int = 7) -> Tuple[datetime, datetime]:
    """
    Returns timezone-naive datetimes [start, end_exclusive] in local date semantics.
    """
    df = parse_date(request.GET.get("date_from"))
    dt = parse_date(request.GET.get("date_to"))
    today = datetime.utcnow().date()

    if not df and not dt:
        dt = today
        df = today - timedelta(days=default_days - 1)
    elif df and not dt:
        dt = df
    elif dt and not df:
        df = dt

    start = datetime.combine(df, datetime.min.time())
    # end is exclusive; add one day to include the dt day
    end = datetime.combine(dt + timedelta(days=1), datetime.min.time())
    return start, end

def int_param(request: HttpRequest, name: str, default: int, min_val: int = 1, max_val: int = 100) -> int:
    try:
        v = int(request.GET.get(name, default))
    except (TypeError, ValueError):
        return default
    return max(min_val, min(max_val, v))
