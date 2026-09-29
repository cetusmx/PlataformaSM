const https = require('https');

https.get('https://sealmarket.net/api1/getresumeninventariosgenerales', (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        try {
            const inventories = JSON.parse(data);
            const latest = inventories[0].InventarioID; // array directly?
            console.log('Latest InventarioID:', latest);
            
            // Try API2 for ubicacionesactivas
            https.get('https://sealmarket.net/api2/api/v1/ubicacionestado/' + latest, (res2) => {
                let data2 = '';
                res2.on('data', (chunk) => { data2 += chunk; });
                res2.on('end', () => {
                    console.log('API2 /ubicacionestado:');
                    console.log(data2);
                });
            });

            https.get('https://sealmarket.net/api2/api/v1/ubicacionesactivas/' + latest, (res3) => {
                let data3 = '';
                res3.on('data', (chunk) => { data3 += chunk; });
                res3.on('end', () => {
                    console.log('API2 /ubicacionesactivas:');
                    console.log(data3);
                });
            });

            // Try API1 for ubicacionesactivas (maybe they put it in API1?)
            https.get('https://sealmarket.net/api1/api/v1/ubicacionestado/' + latest, (res4) => {
                let data4 = '';
                res4.on('data', (chunk) => { data4 += chunk; });
                res4.on('end', () => {
                    console.log('API1 /ubicacionestado:');
                    console.log(data4);
                });
            });

        } catch (e) {
            console.error('Error parsing:', e);
            console.log("Raw data:", data);
        }
    });
});
