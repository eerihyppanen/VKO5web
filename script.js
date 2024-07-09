

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
        
        weight: 2

    }).addTo(map)
    


    map.fitBounds(geoJson.getBounds())

}

fetchData();