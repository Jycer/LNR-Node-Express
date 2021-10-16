# Remove adjacent duplicate rows, ignoring the timestamp field.
# Note: Program rearranges order of the columns in the output
# You should pipe output to resetColOrder.awk to return column order to standard log layout.

BEGIN{FS=",";OFS=","}

{   
gsub("\"","")
gsub(" ","")
print $3 " ",  $1, $2, $4, $5, $6, $7   | "uniq -f1" 

}
