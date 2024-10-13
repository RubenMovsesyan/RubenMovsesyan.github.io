var panorama, viewer, andromeda_panel, container, infospot;


container = document.querySelector("#pano-container");
panorama = new PANOLENS.ImagePanorama("./images/milky_way.jpg");

window.onload = function() {
    andromeda_panel = document.querySelector("#andromeda-panel");
    console.log(andromeda_panel)
    infospot = new PANOLENS.Infospot(350, PANOLENS.DataImage.Info);
    infospot.position.set(-5000, -2100, -300);
    infospot.addHoverElement(andromeda_panel, 150);
    infospot.addEventListener('click', function() {
        window.location.href = "./blogs/andromeda_galaxy/index.html";
    });

    infospot.addEventListener('hoverenter', function() {
        // unfade(andromeda_panel);
        // console.log('Hello');
        // andromeda_panel.classList.remove("panel");
        // andromeda_panel.classList.add("panel-hovered");
    });

    infospot.addEventListener('hoverleave', function() {
        // fade(andromeda_panel);
        // console.log('Bye');
        // andromeda_panel.classList.remove("panel-hovered");
        // andromeda_panel.classList.add("panel");
    });
    panorama.add(infospot);
}

viewer = new PANOLENS.Viewer({ containter: container });
viewer.add(panorama);
