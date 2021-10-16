# Create PlantUML text file.  

BEGIN {print "@startuml"; print"footer End of Trace"}

{

label=""

if ( ($3 == "MSO") && ($5 == "AAI") ) label="Inventory"
if ( ($3 == "MSO") && ($5 == "NARAD") ) label="Inventory"
if ( ($3 == "MSO") && (index($5, "SDNF") > 0 ) ) label="Config Network Fabric"
if ( ($3 == "MSO") && (index($5, "SDNC") > 0 ) ) label="VF-Module Assignment"
if ( ($3 == "MSO") && ($5 == "OPENSTACK") ) label="Instantiate Service"

print $3, $4, $5, ":", $1
print "note right : ", $2, label

}

END {print "@enduml"}
