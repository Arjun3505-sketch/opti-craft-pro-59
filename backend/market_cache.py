import time
import threading
from typing import Dict, Any, Optional
from dataclasses import dataclass
from datetime import datetime, timedelta
import json

@dataclass
class CacheEntry:
    data: Any
    timestamp: float
    ttl: int  # Time to live in seconds

class MarketDataCache:
    """Thread-safe cache for market data with TTL support"""
    
    def __init__(self):
        self._cache: Dict[str, CacheEntry] = {}
        self._lock = threading.RLock()
        self._request_times: Dict[str, float] = {}
        self._min_request_interval = 1.0  # Minimum 1 second between requests per symbol
        
    def get(self, key: str, ttl: int = 300) -> Optional[Any]:
        """Get cached data if not expired"""
        with self._lock:
            if key in self._cache:
                entry = self._cache[key]
                if time.time() - entry.timestamp < entry.ttl:
                    return entry.data
                else:
                    # Remove expired entry
                    del self._cache[key]
            return None
    
    def set(self, key: str, data: Any, ttl: int = 300) -> None:
        """Cache data with TTL"""
        with self._lock:
            self._cache[key] = CacheEntry(
                data=data,
                timestamp=time.time(),
                ttl=ttl
            )
    
    def can_make_request(self, symbol: str) -> bool:
        """Check if enough time has passed since last request for this symbol"""
        with self._lock:
            if symbol not in self._request_times:
                return True
            
            last_request = self._request_times[symbol]
            return time.time() - last_request >= self._min_request_interval
    
    def mark_request(self, symbol: str) -> None:
        """Mark that a request was made for this symbol"""
        with self._lock:
            self._request_times[symbol] = time.time()
    
    def clear_expired(self) -> None:
        """Remove all expired cache entries"""
        with self._lock:
            current_time = time.time()
            expired_keys = [
                key for key, entry in self._cache.items()
                if current_time - entry.timestamp >= entry.ttl
            ]
            for key in expired_keys:
                del self._cache[key]
    
    def get_cache_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        with self._lock:
            return {
                'total_entries': len(self._cache),
                'cache_keys': list(self._cache.keys()),
                'request_times': dict(self._request_times)
            }

# Global cache instance
market_cache = MarketDataCache()