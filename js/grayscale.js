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

const setImports = (serveFrom, elType, attr) => {
  const isDev = serveFrom === "dev";
  $(elType).each((i, el) => {
    let val = $(el).attr(attr);
    if (val && val.indexOf("...") >= 0) {
      $(el).attr(attr, isDev ? val.split("...")[1] : "/impact" + val.split("...")[1])
    }
  })
}


const getValues = () => {
  const gpu = $("#compute-gpu option:selected").val();
  const provider = $("#compute-provider option:selected").val();
  const region = $("#compute-region option:selected").val();
  const hours = parseFloat($("#compute-hours").val());
  return {
    gpu, provider, region, hours
  }
}

const scrollToBottomResultCard = () => {
  const cardOffset = $("#result-card").offset().top + $("#result-card").outerHeight() - $(window).height() + 50;
  $("html, body").animate({
    scrollTop: cardOffset
  }, 1000, "easeInOutExpo");
  return
}

const growDivOnArrowClick = (clickId, growId) => {
  $(clickId).click(function () {
    if (!$(this).find(".arrow-icon").hasClass("open")) {
      var h = 0;
      $(growId).children().each((k, v) => {
        h += $(v).innerHeight()
      })
      $(growId).height(h);

      setTimeout(() => {
        if ($(window).height() > ($("#result-card").outerHeight() + 150) && !isBottomVisible()) {
          scrollToBottomResultCard()
        }
      }, 500)

    } else {
      $(growId).height(0);
      setTimeout(() => {
        !isBottomVisible(50) && scrollToBottomResultCard();
      }, 500);
    }

    $(this).find(".arrow-icon").toggleClass("open");
  });
}
const growDivOnArrowClickLearn = (clickId, growId) => {
  $(clickId).click(function () {
    if (!$(this).find(".arrow-icon").hasClass("open")) {
      var h = 0;
      $(this).siblings(growId).children().each((k, v) => {
        h += $(v).innerHeight()
      })
      $(this).siblings(growId).height(h);
    } else {
      $(this).siblings(growId).height(0);
    }
    $(this).find(".arrow-icon").toggleClass("open");
  });
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

const twoDigits = n => Number(Number(n).toFixed(2));

const setDetails = (values) => {
  const { gpu, hours, provider, region } = values
  const energy = twoDigits(state.gpus[gpu].watt * hours / 1000); // kWh
  const impact = twoDigits(state.providers[provider][region].impact / 1000); // kg/kwH
  const co2 = twoDigits(energy * impact);
  const offset = twoDigits(co2 * state.providers[provider][region].offsetRatio / 100)
  $("#emitted-value").text(co2);
  $("#offset-value").text(offset);
  $("#details-counts").html(`
  ${state.gpus[gpu].watt}W x ${hours}h = <strong>${energy} kWh</strong> x ${impact}
  kg  eq. CO<sub>2</sub>/kWh = <strong>${co2} kg eq. CO<sub>2</sub></strong>
  `);

  const provName = state.providers[provider][region].providerName;
  const minRegId = state.providers[provider].__min.region;
  const minReg = state.providers[provider][minRegId];
  if (region !== minRegId) {
    const minco2 = twoDigits(energy * minReg.impact / 1000);
    $("#details-min-selected").hide()
    $("#details-alternative").html(
      `
      Had this model been run in ${provName}'s <strong>${minReg.regionName}</strong> region,
      the carbon emitted would have been of <strong>${minco2}</strong> kg eq. CO<sub>2</sub>
      `
    )
    $("#details-alternative").show()
  } else {
    $("#details-min-selected").show()
    $("#details-alternative").hide()
    $("#details-min-region").html(
      `
      You have selected ${provName}'s cleanest region!
      `
    )
  }


}

const isBottomVisible = _bottomOffset => {
  const bottomOffset = _bottomOffset || 0;
  return $("#result-card").offset().top + $("#result-card").outerHeight() + bottomOffset < ($(window).scrollTop() + $(window).height())
}

const submitCompute = (_values) => {
  $("#result-card").hide();
  $("#details-content").height(0);
  $("#details-banner .arrow-icon").removeClass("open")
  $(".spinner-border").show()
  // const values = _values ? _values : checkForm();
  const values = getValues();
  if (!values) return;

  setDetails(values);
  state.current = values

  setTimeout(() => {
    $(".spinner-border").hide()
    $("#result-card").fadeIn();
    $("#compute-carbon-emitted-title").height(
      $("#compute-carbon-offset-title").height()
    )

    console.log($(window).scrollTop() + $(window).height());

    if ($(window).width() < 769 || !isBottomVisible()) {
      scrollToBottomResultCard()
    }
  }, getRandomInt(500, 1200)
  )
}


const setRegion = provider => {
  $("#compute-region").html('');
  let regs = [];
  for (const region in state.providers[provider]) {
    if (state.providers[provider].hasOwnProperty(region) && region !== "__min") {
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

const setInputs = () => {
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
        if (state.providers[provider].hasOwnProperty(region) && region !== "__min") {
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

  // // Activate scrollspy to add active class to navbar items on scroll
  // $('body').scrollspy({
  //   target: '#mainNav',
  //   offset: 100
  // });
  // $('[data-spy="scroll"]').on('activate.bs.scrollspy', function () {
  //   console.log(this);
  // })

  const observer = lozad();
  observer.observe();

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
  $("#compute-loader").fadeOut(() => {
    $("#compute-container").fadeIn()
  })

  setInputs();
  setImports(serveFrom, "a", "href");
  setImports(serveFrom, "img", "src");

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

  $(".details-summary").each((i, el) => {

    if (i % 2 == 0 || $(window).width() < 770) {
      const arrowTemplate = `
      <a class="arrow-icon arrow-learn-even" title="Learn more">
      <span class="left-bar"></span>
      <span class="right-bar"></span>
      </a>
      `
      $(el).append($(arrowTemplate))
    } else {
      const arrowTemplate = `
      <a class="arrow-icon arrow-learn-odd" title="Learn more">
      <span class="left-bar"></span>
      <span class="right-bar"></span>
      </a>
      `
      $(el).css("justify-content", "flex-end");
      $(el).prepend($(arrowTemplate))
    }
  });

  growDivOnArrowClickLearn(`.details-summary`, `.summary-content`);
  growDivOnArrowClick("#details-banner", "#details-content");

  $("#details-featured-maps").click()

  const response = await fetch("https://api.co2signal.com/v1/latest?lon=6.8770394&lat=45.9162776", {
    credentials: "include",
    headers: {
      'Content-Type': 'application/jsonp',
      'auth-token': 'c5f38468eddd9edb'
    }
  })
  console.log({ response });


})(jQuery); // End of use strict
