/**
 * 'Magic' constant strings collected in one place.
 */

// Key names provided by REST API, used to normalize data for chrime.hid API.
export const vendor_ID_key = 'vendorID';
export const product_ID_key = 'deviceID';

const vendorId = 1209;

export const pokey_device_filter: USBDeviceFilter = {
    vendorId,
    productId: 2800
};

export const peggy_device_filter: USBDeviceFilter = {
    vendorId,
    productId: 2801
};
