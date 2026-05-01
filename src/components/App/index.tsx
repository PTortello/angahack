import { useMemo, useRef, useState } from "react";
import { Box, Paper, TextField, Typography } from "@mui/material";
import { BUFFER, ITEM_HEIGHT, VIEW_HEIGHT } from "constants/itemsList";
import { products } from "data/products";

function App() {
  const [query, setQuery] = useState("");
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => p.displayNameLower.includes(q));
  }, [query]);

  const startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - BUFFER);
  const endIndex = Math.min(filtered.length, Math.ceil((scrollTop + VIEW_HEIGHT) / ITEM_HEIGHT) + BUFFER);
  const visibleItems = filtered.slice(startIndex, endIndex);
  const offsetY = startIndex * ITEM_HEIGHT;

  return (
    <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1 }}>
      <TextField
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        size="small"
        placeholder="Filter..."
        fullWidth
      />
      <Paper
        ref={containerRef}
        sx={{ height: VIEW_HEIGHT, overflowY: "auto", position: "relative" }}
        onScroll={(e) =>
          setScrollTop((e.target as HTMLDivElement).scrollTop)
        }
      >
        <Box sx={{ height: filtered.length * ITEM_HEIGHT, position: "relative" }}>
          <Box sx={{ transform: `translateY(${offsetY}px)`, position: "absolute", width: "100%" }}>
            {visibleItems.map((p, i) => (
              <Box
                key={startIndex + i}
                sx={{
                  height: ITEM_HEIGHT,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  px: 1,
                }}
              >
                <Typography variant="body2">{p.displayName}</Typography>
                <Typography variant="body2">{p.quantity}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}

export default App;
