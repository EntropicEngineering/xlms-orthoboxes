/**
 * 'Magic' constant strings collected in one place.
 */

export const session_data_identifier = "session_data";
export const redirect_identifier = "redirect_URL";
export const endpoint_identifier = "endpoint";

const vendorId = 1209;

export const pokey_device_filter: USBDeviceFilter = {
    vendorId,
    productId: 2800
};

export const peggy_device_filter: USBDeviceFilter = {
    vendorId,
    productId: 2801
};
