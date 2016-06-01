'use strict'
var queryTime = 10000;

var fbIds = ['10154325078698083', '10154325078883083', '10154325078893083']
var instaIds = ['BGBcOACtvP7', 'BGBcj9TNvAW', 'BGBcY1oNvAE']
var names = ['Windeck', 'HLA', 'Louis-Lepoix']
var fbCount = [0, 0, 0];
var instaCount = [0, 0, 0];

function init() {
  console.log('INIT')
  FB.getLoginStatus(function(response) {
    if (response.status === 'connected') {
      console.log('Logged in.');
      fbReady();
    }
    else {
      FB.login(fbReady);
    }
  });
}

function fbReady() {
  queryLoop();
}

function queryLoop() {
  queryFB();
  queryInsta();
  setTimeout(queryLoop, queryTime);
}

function queryFB() {
  for (var i = 0; i < fbIds.length; i++) {
    querySingleFB(i, function() {
      updateView();
    });
  }
}

function querySingleFB(id, cb) {
  FB.api('/' + fbIds[id] + '?fields=likes.summary(true)', function(response) {
    fbCount[id] = response.likes.summary.total_count;
    cb();
  });
}

function queryInsta() {
  var r = new XMLHttpRequest();
  r.open("GET", "http://cors.io/?u=https://www.instagram.com/volksbankbuehl/media/", true);
  r.onreadystatechange = function() {
    if (r.readyState != 4 || r.status != 200) return;
    var data = JSON.parse(r.responseText);
    for (var j = 0; j < instaIds.length; j++) {
      var code = instaIds[j];
      for (var i = 0; i < data.items.length; i++) {
        var item = data.items[i];
        if (item.code != code) continue;
        instaCount[j] = item.likes.count;
      }
    }
    updateView();
  }
  r.send();
}

function compareTotal(a, b) {
  if (a.total < b.total) {
    return -1;
  } else if (a.total > b.total) {
    return 1;
  }
  return 0;
}

function updateView() {
  var rootDiv = document.getElementById('leader-root');
  // Clear everything
  while (rootDiv.firstChild) {
    rootDiv.removeChild(rootDiv.firstChild);
  }
  var sorted = [];

  for (var i = 0; i < names.length; i++) {
    sorted.push({name: names[i], fb: fbCount[i], insta: instaCount[i], total: fbCount[i] + instaCount[i]});
  }
  sorted.sort(compareTotal).reverse();

  for (var i = 0; i < sorted.length; i++) {
    var el = sorted[i];
    var listEl = document.createElement("DIV");
    listEl.className = "list-item";

    var nameEl = document.createElement("H2");
    nameEl.innerText = el.name;

    var totalEl = document.createElement("DIV");
    totalEl.className = "total";
    totalEl.innerText = el.fb + el.insta;

    var fbEl = document.createElement("DIV");
    var fbIconEl = document.createElement("SPAN");
    fbIconEl.className = "fa fa-facebook-official"
    fbEl.className = "fb";
    fbEl.innerText = el.fb;
    fbEl.appendChild(fbIconEl);

    var instaEl = document.createElement("DIV");
    var instaIconEl = document.createElement("SPAN");
    instaIconEl.className = "fa fa-instagram"
    instaEl.className = "insta";
    instaEl.innerText = el.insta;
    instaEl.appendChild(instaIconEl);

    listEl.appendChild(nameEl);
    listEl.appendChild(totalEl);
    listEl.appendChild(fbEl);
    listEl.appendChild(instaEl);
    rootDiv.appendChild(listEl);
  }

  var updatedEl = document.getElementById('last-updated');
  updatedEl.innerText = new Date().toLocaleTimeString();
}
