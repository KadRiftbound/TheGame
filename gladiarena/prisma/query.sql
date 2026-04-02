SELECT z.id, z.name, COUNT(m.id) as mz_count 
FROM Zone z 
LEFT JOIN MicroZone m ON m.zoneId = z.id 
GROUP BY z.id 
ORDER BY mz_count DESC 
LIMIT 10;