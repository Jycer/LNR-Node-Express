# Keep audit logs and header row only.

BEGIN {FS = "," }
{ if ( (index($6,"audit") > 0) || (NR==1) )   print $0 } 