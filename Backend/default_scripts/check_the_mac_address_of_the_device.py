import subprocess
import re

def mac_address_checker():
    # Call dmcli command to get mac address of device
    result = subprocess.run(["dmcli", "eRT", "retv", "Device.DeviceInfo.X_COMCAST-COM_CM_MAC"], capture_output=True, text=True)
    
    # Remove leading and trailing whitespace from output
    mac_address = result.stdout.strip()
    
    # Check if mac address matches expected result
    match = re.search(r'^[0-9A-F]{12}$', mac_address)
    if match:
        print("[PASS] Mac address matches expected result")
    else:
        print("[FAIL] Mac address does not match expected result")

if __name__ == "__main__":
    mac_address_checker()
