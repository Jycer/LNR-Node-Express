# Ignore header row, remove quotes (") and sort based on timestamp

NR<2 {print $0;next} 
{gsub("\"","");print $0 | "gsort -t, -k3 -d"}