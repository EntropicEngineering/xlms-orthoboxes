/**
 * Created by riggs on 7/31/16.
 *
 * API for sending & receiving data from the XLMS REST API.
 */
'use strict';


import { DEBUG, exit } from './utils';
import { user_input, Window_Closed_Error } from './user_input';

export interface REST_Data {
    "id": string,
    "exercise": string,
    "course": string,
    "result_id": string,
    "trainer_id": string | null,
    "session_data": string | null,
    "start_time": string | null,
    "elapsed_time": string | null,
    "success": string,
    "closed": string,
    "kurento_url": string,
    "kurento_video_directory": string,
    "name": string | null,
    "interface": string,
    "hardware": [
        {
            "vendorID": number,
            "deviceID": number
        }
    ],
    "metrics": {
        "elapsed_time": {
            "maximum": string,
            "minimum": string
        },
        "wall_error_count": {
            "maximum": string
        },
        "wall_error_length": {
            "maximum": string
        },
        "drop_error_count": {
            "maximum": string
        }
    },
    "configuration": Array<string>
}

export async function get_session_data(URL: string) {
    async function retrieve() {
        try {
            return await fetch(URL).then(response => response.json());
        } catch ( error ) {
            DEBUG(error);
            try {
                let result = await user_input(`Error: ${error.message}`, {
                    Retry: async () => await retrieve(),
                    Exit: exit
                });
                return await result();
            } catch ( error ) {
                if ( error instanceof Window_Closed_Error ) {
                    exit();
                } else {
                    throw error;
                }
            }
        }
    }

    let REST_data = await retrieve() as REST_Data;
    DEBUG(REST_data);

    return REST_data;
}

export interface Results {
    success: number,
    start_time: number,
    elapsed_time: number,
    results: {
        wall_errors: Array<{ timestamp: number, duration: number }>,
        drop_errors: Array<{ timestamp: number }>
    }
}
export async function send_results(URL: string, results: Results) {
    let response = await fetch(URL, {
        method: 'put',
        headers: {
            'Content-type': 'application/json; charset=UTF-8'
        },
        body: JSON.stringify(results)
    });
    // TODO: Error handling, via user_input.
    return response.ok;
}
