

const fetchData = async () => {
    const url = "https://geo.stat.fi/geoserver/wfs?service=WFS&version=2.0.0&request=GetFeature&typeName=tilastointialueet:kunta4500k&outputFormat=json&srsName=EPSG:4326"
    const positiveUrl = "https://statfin.stat.fi/PxWeb/sq/4bb2c735-1dc3-4c5e-bde7-2165df85e65f"
    const negativeUrl = "https://statfin.stat.fi/PxWeb/sq/944493ca-ea4d-4fd9-a75c-4975192f7b6e"

    const res = await fetch(url);
    const res2 = await fetch(positiveUrl);
    const res3 = await fetch(negativeUrl);

    const data = await res.json();
    const positiveMigration = await res2.json();
    const negativeMigration = await res3.json();
    console.log("Positive Migration Data:", positiveMigration);
    console.log("Negative Migration Data:", negativeMigration);

    initmap(data, positiveMigration, negativeMigration);

}

const initmap = (data, positiveMigration, negativeMigration) => {


    const positiveData = positiveMigration.dataset.value;
    const negativeData = negativeMigration.dataset.value;
    const municipalityCodes = positiveMigration.dataset.dimension.Tuloalue.category.index;

    console.log("Municipality Codes:", municipalityCodes);

    
    const positiveMigrationMap = {};
    const negativeMigrationMap = {};

    Object.keys(municipalityCodes).forEach(key => {
        positiveMigrationMap[key] = positiveData[municipalityCodes[key]];
        negativeMigrationMap[key] = negativeData[municipalityCodes[key]];
    });

    console.log("Positive Migration Map:", positiveMigrationMap);//needed some debugging had problems with municipalitycodes
    console.log("Negative Migration Map:", negativeMigrationMap);

    data.features.forEach(feature => {
        const municipalityCode = `KU${feature.properties.kunta}`; 

        if (municipalityCode in positiveMigrationMap) {
            feature.properties.positiveMigration = positiveMigrationMap[municipalityCode] || 0; 
            feature.properties.negativeMigration = negativeMigrationMap[municipalityCode] || 0; 
        } else {
            console.warn(`Municipality code not found for: ${municipalityCode}`);
        }
    });


    let map = L.map('map', {
        minZoom: -2

    })

    let geoJson = L.geoJSON(data, {
        style: (feature) => {
            const positiveMigration = feature.properties.positiveMigration;
            const negativeMigration = feature.properties.negativeMigration;

            return {
                fillColor: getColor(positiveMigration, negativeMigration),
                weight: 2,
                opacity: 1,
                color: 'black',
                dashArray: '3',
                fillOpacity: 0.7
            };
        },
        onEachFeature: getFeature,
        weight: 2
        

    }).addTo(map)
    
    let osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap"
    }).addTo(map);


    map.fitBounds(geoJson.getBounds())

}

const getFeature =(feature, layer) =>   {
    if (!feature.properties.name) return;
    const name = feature.properties.nimi;
    const positiveMigration = feature.properties.positiveMigration;
    const negativeMigration = feature.properties.negativeMigration;

    layer.on({
        mouseover: (e) => {
            layer.bindTooltip(name, {
                permanent: false,
                direction: "top"
            }).openTooltip(e.latlng);
        },
        mouseout: (e) => {
            layer.closeTooltip();
        },
        click: (e) => {
            layer.bindPopup(
                `<strong>${name}</strong><br>Positive Migration: ${positiveMigration}<br>Negative Migration: ${negativeMigration}`
            ).openPopup(e.latlng);
        }
    });
    
}

const getColor = (positiveMigration, negativeMigration) => {
    
    if (negativeMigration === 0) negativeMigration = 1;
    
    
    const ratio = positiveMigration / negativeMigration;
    const hue = Math.min(ratio ** 3 * 60, 120);
    
    
    return `hsl(${hue}, 75%, 50%)`;
}


fetchData();