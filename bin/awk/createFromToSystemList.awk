# Create "from" and "to" system list and aggregate intercomponent log records.
# Clean up any special cases for source and destination systems.


BEGIN {FS = ","}
NR>1 {
if ( index($6,"audit") > 0) {

gsub("\"","")
gsub("-","_")
gsub("&","_")

from_sys=toupper($5)
tmp=from_sys

if ( (index(tmp, "MSO") > 0 ) || (index(tmp, "SO.") > 0)  ) from_sys="MSO"

if ( index(tmp, "LYNKIT") > 0 ) from_sys="LYNKIT"

if ( index(tmp, "SDNCP") > 0 ) from_sys="SDNCP"

if ( index(tmp, "SDNGC") > 0 ) from_sys="SDNGC"

if ( index(tmp, "STABILITY") > 0 ) from_sys="LYNKIT2"

if ( index(tmp, "VID.ECOMP") > 0 ) from_sys="VID"

if ( index(tmp, "DOWNSTREAM.CSI") > 0 ) from_sys="CSI"

if ( index(tmp, "CCD.ATT.COM") > 0 ) from_sys="CCD"

if ( index(tmp, "SNIRO.ATT.COM") > 0 ) from_sys="SNIRO"

if ( index(tmp, "PROD.APPC.ATT.COM") > 0 ) from_sys="APPC"

if ( ( index(tmp, "SDNF") > 0 ) || ( index(tmp, "SDN-F") > 0 ) || ( index(tmp, "PINC") > 0 ) ) from_sys="PINC"

if (length(tmp) == 0) from_sys="MISSING"

gsub("_180","",$1) 
 
to_sys=toupper($1)
tmp=to_sys

if ( (index($5,"SO.OPENSTACK_ADAPTER") > 0 ) && (index($4,"OpenstackAdapter") > 0) ) to_sys="OPENSTACK"

if ( ( index(tmp, "SDNF") > 0 ) || ( index(tmp, "SDN-F") > 0 ) || ( index(tmp, "PINC") > 0 ) ) to_sys="PINC"

if (from_sys != to_sys ) {
 print $7, $3, from_sys, "->", to_sys | "uniq -f2"
 
}

}
}