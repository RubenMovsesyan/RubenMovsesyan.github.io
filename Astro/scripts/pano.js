var panorama, 
    viewer, 
    container, 
    andromeda_panel, 
    andromeda_infospot,
    pleiades_panel,
    pleiades_infospot;


container = document.querySelector("#pano-container");
panorama = new PANOLENS.ImagePanorama("./images/milky_way_360.jpg");

add_andromeda = function() {
    andromeda_panel = document.querySelector("#andromeda-panel");
    // console.log(andromeda_panel)
    andromeda_infospot = new PANOLENS.Infospot(15, PANOLENS.DataImage.Info);
    andromeda_infospot.position.set(-128, -115, 246);
    andromeda_infospot.addHoverElement(andromeda_panel, 200);
    andromeda_infospot.addEventListener('click', function() {
        window.location.href = "./blogs/andromeda_galaxy/index.html";
    });

    andromeda_infospot.addEventListener('hoverenter', function() {
    });

    andromeda_infospot.addEventListener('hoverleave', function() {
    });
    panorama.add(andromeda_infospot);
}

add_pleiades = function() {
    pleiades_panel = document.querySelector("#pleiades-panel");
    // console.log(pleiades_panel)
    pleiades_infospot = new PANOLENS.Infospot(15, PANOLENS.DataImage.Info);
    pleiades_infospot.position.set(-256, -128, 80);
    pleiades_infospot.addHoverElement(pleiades_panel, 200);
    pleiades_infospot.addEventListener('click', function() {
        window.location.href = "./blogs/pleiades/index.html";
    });

    pleiades_infospot.addEventListener('hoverenter', function() {
    });

    pleiades_infospot.addEventListener('hoverleave', function() {
    });
    panorama.add(pleiades_infospot);
}

window.onload = function() {
    add_pleiades();
    add_andromeda();
}

viewer = new PANOLENS.Viewer({ containter: container });
viewer.add(panorama);
