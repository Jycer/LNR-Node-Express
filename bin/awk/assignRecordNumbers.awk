# Assign sequential record numbers to each log record
# Allows user to back-check UML sequence diagram against input file.

{print $0 "," NR}