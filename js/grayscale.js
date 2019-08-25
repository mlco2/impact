var state;
var FEATURES = ["gpu", "provider", "region", "hours"];

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function findGetParameter(parameterName) {
  var result = null, tmp = [];
  location.search
    .substr(1)
    .split("&")
    .forEach(function (item) {
      tmp = item.split("=");
      if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
    });
  return result;
}

function insertParam(kvp, key, value) {
  key = encodeURI(key); value = encodeURI(value);
  var i = kvp.length; var x; while (i--) {
    x = kvp[i].split('=');

    if (x[0] == key) {
      x[1] = value;
      kvp[i] = x.join('=');
      break;
    }
  }
  if (i < 0) { kvp[kvp.length] = [key, value].join('='); }
  return kvp
}

function sc(id) {
  $('html,body').animate({
    scrollTop: $("#" + id).offset().top - parseInt($("#" + id).height() / 1.2)
  }, 'slow');
}

// ------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------
//                                              FORM HANDLING
// ------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------


const getValues = () => {
  const gpu = $("#compute-gpu option:selected").val();
  const provider = $("#compute-provider option:selected").val();
  const region = $("#compute-region option:selected").val();
  const hours = parseInt($("#compute-hours").val(), 10);
  return {
    gpu, provider, region, hours
  }
}

const fail = (id) => {
  $("#result-card").hide();
  $(".spinner-border").hide()
  $("#compute-" + id).css("border", "2px solid red");
  setInputs();
}

const check = (type, value) => {
  $("#compute-hours").css("border", "");
  switch (type) {
    case "gpu":
      console.log(state.gpus, value)
      return state.gpus.filter((v, k) => { return v.name === value }).length;
    case "hours":
      return Number.isInteger(value) && value > 0 && value < 1e6;
    case "provider":
      return state.providers.filter((v, k) => { return v.name === value }).length;
    case "region":
      return state.regions.filter((v, k) => { return v.name === value }).length;
    default:
      return true;
  }
}

const checkForm = () => {
  const values = getValues();
  const { gpu, provider, region, hours } = values;
  console.log({ values });
  let failed = false;

  FEATURES.forEach((v, k) => {
    if (!check(k, v)) {
      fail(k)
      failed = true;
    }
  });
  if (failed) return null

  return values;
}

const submitCompute = (_values) => {
  $("#result-card").hide();
  $(".spinner-border").show()
  // const values = _values ? _values : checkForm();
  const values = getValues();
  console.log(values);
  if (!values) return;
  const { gpu, hours, provider, region } = values

  // setGetParams(values);

  // Computations

  const energy = state.gpus[gpu].watt * hours;
  const co2 = energy * state.providers[provider][region].impact / 1000;
  const offset = co2 * state.providers[provider][region].offsetRatio / 100

  $("#emitted-value").text(parseInt(co2));
  $("#offset-value").text(parseInt(offset));
  $("#details-counts").text(`${state.gpus[gpu].watt} x ${hours} x ${state.providers[provider][region].impact / 1000}`)

  setTimeout(() => {
    $(".spinner-border").hide()
    $("#result-card").fadeIn();
    if ($(window).width() < 769) {
      $("#goToResults").trigger("click");
    }
  }, getRandomInt(500, 1200)
  )
}


const parseGetParams = () => {
  let values = {};
  for (const key of FEATURES) {
    const val = findGetParameter(key);
    console.log(key, val, check(key, val));
    if (key === "hours") val = parseInt(val);
    if (val && check(key, val)) values[key] = val;
  }
  console.log("get param values", values);
  if ($.isEmptyObject(values)) {
    window.history.pushState('', '', window.location.pathname);
    return;
  }

  setGetParams(values);
  updateInputs(values);
  setTimeout(() => {
    $("#compute-nav-link").trigger("click");
  }, 500)
}

const setGetParams = (values) => {
  var kvp = [];
  for (const key in values) {
    if (values.hasOwnProperty(key)) {
      const value = values[key];
      kvp = insertParam(kvp, key, value)
    }
  }
  window.history.pushState('', '', '?' + kvp.join("&"));
}

const updateInputs = (values) => {
  for (const key of FEATURES) {
    if (values.hasOwnProperty(key)) {
      $("#compute-" + key).val(values[key]);
    }
  }
}

const setInputs = () => {
  ["gpu", "region", "provider"].forEach((input, k) => {
    $("#compute-" + input).html(state[input + "s"].map((v, i) => {
      return `<option value="${v.name}">${v.name}</option>`
    }).join(""));
  })
}

const setRegion = provider => {
  $("#compute-region").html('');
  let regs = [];
  for (const region in state.providers[provider]) {
    if (state.providers[provider].hasOwnProperty(region)) {
      let { regionName } = state.providers[provider][region];
      if (!regionName) {
        regionName = region;
      }
      regs.push({ region, regionName })
    }
  }
  regs.sort((a, b) => (
    a.regionName > b.regionName) ? 1 : ((b.regionName > a.regionName) ? -1 : 0)
  );
  for (const reg of regs) {
    const { regionName, region } = reg;
    $("#compute-region").append(`<option value="${region}">${regionName}</option>`)
  }
}

const setInputs2 = () => {
  for (const gpuName in state.gpus) {
    $("#compute-gpu").append(`<option value="${gpuName}">${gpuName}</option>`)
  }
  let prov;
  let i = 0;
  for (const provider in state.providers) {
    if (i == 0) prov = provider;
    i++;
    if (state.providers.hasOwnProperty(provider)) {
      let providerName;
      for (const region in state.providers[provider]) {
        if (state.providers[provider].hasOwnProperty(region)) {
          providerName = state.providers[provider][region]["providerName"];
          break;
        }
      }
      $("#compute-provider").append(`<option value="${provider}">${providerName}</option>`)
    }
  }
  setRegion(prov)
}


(async function ($) {
  "use strict"; // Start of use strict

  // Smooth scrolling using jQuery easing
  $('a.js-scroll-trigger[href*="#"]:not([href="#"])').click(function () {
    if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
      var target = $(this.hash);
      target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
      if (target.length) {
        $('html, body').animate({
          scrollTop: (target.offset().top - 70)
        }, 1000, "easeInOutExpo");
        let w = window.location.pathname;
        if (w[w.length - 1] !== "/") w += "/"
        window.history.pushState('', '', w + this.hash);
        return false;
      }
    }
  });

  // Closes responsive menu when a scroll trigger link is clicked
  $('.js-scroll-trigger').click(function () {
    $('.navbar-collapse').collapse('hide');
  });

  // Activate scrollspy to add active class to navbar items on scroll
  $('body').scrollspy({
    target: '#mainNav',
    offset: 100
  });

  // $("#navbarResponsive a").on('activate', function () {
  //   console.log($(this));
  // });

  // Collapse Navbar
  var navbarCollapse = function () {
    if ($("#mainNav").offset().top > 100) {
      $("#mainNav").addClass("navbar-shrink");
    } else {
      $("#mainNav").removeClass("navbar-shrink");
    }
  };
  // Collapse now if page is not at top
  navbarCollapse();
  // Collapse the navbar when page is scrolled
  $(window).scroll(navbarCollapse);



  state = await getData();
  console.log(state);
  setInputs2();

  $("#compute-provider").change(e => {
    const provider = $("#compute-provider option:selected").val();
    setRegion(provider)
  })

  $("#compute-form").submit(e => {
    submitCompute();
    return false;
  })

  $(".compute-input").change(() => {
    $("#compute-submit").prop("disabled", true);
    if (checkForm()) $("#compute-submit").prop("disabled", false);
  })
  $(".arrow-icon").click(function () {
    if ($(this).hasClass("open")) {
      var h = 0;
      $("#details-content").children().each((k, v) => {
        h += $(v).innerHeight()
      })
      $("#details-content").height(h);
    } else {
      $("#details-content").height(0);
    }
    $(this).toggleClass("open");
  });


})(jQuery); // End of use strict
