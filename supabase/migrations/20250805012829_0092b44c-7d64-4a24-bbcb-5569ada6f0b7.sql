-- Remove duplicate matches, keeping only the first occurrence
DELETE FROM matches a USING (
  SELECT MIN(ctid) as ctid, home_team, away_team, league, match_date, status
  FROM matches 
  GROUP BY home_team, away_team, league, match_date, status
  HAVING COUNT(*) > 1
) b
WHERE a.home_team = b.home_team 
  AND a.away_team = b.away_team 
  AND a.league = b.league 
  AND a.match_date = b.match_date 
  AND a.status = b.status 
  AND a.ctid <> b.ctid;