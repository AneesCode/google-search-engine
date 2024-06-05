let map;
let service;

function infosubmit() {
    let form = document.getElementById("form");
    let hide = Math.floor(Math.random() * 200);
    let address = document.getElementById("address").value;
    let email = document.getElementById("email").value;
    let name = document.getElementById("name").value;
    let userdata = JSON.parse(localStorage.getItem("profiledetails")) ?? {};
    let b = {
        [hide]: {
            'name': name,
            'email': email,
            'location': address,
        }
    };
    Object.assign(userdata, b);
    localStorage.setItem("profiledetails", JSON.stringify(userdata));
    display();
    form.reset();
}

function display() {
    let userdata = JSON.parse(localStorage.getItem("profiledetails")) ?? {};
    let tbody = document.querySelector(".tbody");
    let final = "";
    for (let element in userdata) {
      
        final += `
            <tr>
                <td class="infoname" id="${element}">${userdata[element].name}</td>
                <td>${userdata[element].email}</td>
                <td><a href="#" data-location="${userdata[element].location}">${userdata[element].location}</a></td>
            </tr>`;
    }
    if (tbody) {
        tbody.innerHTML = final;
        tbody.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function(event) {
                event.preventDefault();
                const location = this.getAttribute('data-location');
                findPlace(location);
            });
        });

        tbody.querySelectorAll('.infoname').forEach(nameCell => {
            nameCell.addEventListener('mouseover', showTooltip);
        });
    }
}
display();

function findPlace(query) {
    const request = {
        query: query,
        fields: ['name', 'geometry'],
    };

    service.findPlaceFromQuery(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            const place = results[0];
            if (place.geometry) {
                map.setCenter(place.geometry.location);
                map.setZoom(8);
                new google.maps.Marker({
                    map: map,
                    position: place.geometry.location,
                });
            } else {
                alert("No details available for input: '" + query + "'");
            }
        } else {
            alert("Find place was not successful for the following reason: " + status);
        }
    });
}

function initAutocomplete() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 30.3753, lng: 69.3451 }, 
        zoom: 5,
        mapTypeId: "roadmap",
    });

    service = new google.maps.places.PlacesService(map);

    const input = document.getElementById("address");
    const autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.bindTo("bounds", map);

    autocomplete.addListener("place_changed", function () {
        const place = autocomplete.getPlace();
        if (!place.geometry) {
            alert("No details available for input: '" + place.name + "'");
            return;
        }

        if (place.geometry.viewport) {
            map.fitBounds(place.geometry.viewport);
        } else {
            map.setCenter(place.geometry.location);
            map.setZoom(10);
        }

        new google.maps.Marker({
            map: map,
            position: place.geometry.location,
        });

        localStorage.setItem("selectedPlace", JSON.stringify(place.geometry.location));
    });
}
window.initAutocomplete = initAutocomplete;

function showTooltip(event) {
    let userdata = JSON.parse(localStorage.getItem("profiledetails")) ?? {};
    const elementId = event.target.getAttribute('id');
    const user = userdata[elementId];
    console.log(user.name);
    const request = {
        query: user.location,
        fields: ['name', 'geometry'],
    };

    service.findPlaceFromQuery(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            const place = results[0];
            if (place.geometry) {
                map.setCenter(place.geometry.location);
                map.setZoom(8);
             const marker =   new google.maps.Marker({
                    map: map,
                    position: place.geometry.location,
                });
                const showtip = new google.maps.InfoWindow({
                    content: `
                            <strong>Name:${userdata[elementId].name}</strong> <br>
                            <strong>Email:${userdata[elementId].email}</strong> <br>
                            <strong>Location:${userdata[elementId].location}</strong>
                    `,
                });

                showtip.open(map, marker);
            } 
        } 
    });
}


