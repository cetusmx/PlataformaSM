const https = require('https');

https.get('https://sealmarket.net/api2/getresumeninventariosgenerales', (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        try {
            const inventories = JSON.parse(data);
            const latest = inventories.body[0].InventarioID;
            console.log('Latest InventarioID:', latest);
            
            // Now fetch ubicacionesactivas
            https.get('https://sealmarket.net/api2/api/v1/ubicacionesactivas/' + latest, (res2) => {
                let data2 = '';
                res2.on('data', (chunk) => { data2 += chunk; });
                res2.on('end', () => {
                    console.log('Response for /ubicacionesactivas:');
                    console.log(data2);
                });
            });

            // Also try ubicacionestado fallback just in case
            https.get('https://sealmarket.net/api2/api/v1/ubicacionestado/' + latest, (res3) => {
                let data3 = '';
                res3.on('data', (chunk) => { data3 += chunk; });
                res3.on('end', () => {
                    console.log('Response for /ubicacionestado fallback:');
                    console.log(data3);
                });
            });

        } catch (e) {
            console.error('Error parsing:', e);
        }
    });
});
