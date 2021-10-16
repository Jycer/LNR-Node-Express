# Resets column order to standard log layout.
# Used after running removeAdjacentDuplicates.awk

BEGIN{FS=","; OFS=","}
{
gsub(" ","")
print $2, $3, $1, $4, $5, $6, $7
}