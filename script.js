

const fetchData = async () => {
    const url = "https://geo.stat.fi/geoserver/wfs?service=WFS&version=2.0.0&request=GetFeature&typeName=tilastointialueet:kunta4500k&outputFormat=json&srsName=EPSG:4326"
    const res = await fetch(url);
    const data = await res.json();

    initmap(data);

}

const initmap = (data) => {
    let map = L.map('map', {
        minZoom: -2

    })

    let geoJson = L.geoJSON(data, {
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
    const name = feature.properties.name;
    layer.on({
        mouseover: (e) => {
            layer.bindTooltip(name, {
                permanent: false,
                direction: "top"
            }).openTooltip(e.latlng);
        },
        mouseout: (e) => {
            layer.closeTooltip();
        }
    });
    
}

fetchData();