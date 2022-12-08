var state;
var FEATURES = ["gpu", "provider", "region", "hours"];

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function selectAndCopyText(containerid) {
  if (document.selection) {
    // IE
    var range = document.body.createTextRange();
    range.moveToElementText(document.getElementById(containerid));
    range.select();
    document.execCommand("copy");
  } else if (window.getSelection) {
    var range = document.createRange();
    range.selectNode(document.getElementById(containerid));
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    document.execCommand("copy");
  }
}

function findGetParameter(parameterName) {
  var result = null,
    tmp = [];
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
  key = encodeURI(key);
  value = encodeURI(value);
  var i = kvp.length;
  var x;
  while (i--) {
    x = kvp[i].split("=");

    if (x[0] == key) {
      x[1] = value;
      kvp[i] = x.join("=");
      break;
    }
  }
  if (i < 0) {
    kvp[kvp.length] = [key, value].join("=");
  }
  return kvp;
}

function sc(id) {
  $("html,body").animate(
    {
      scrollTop:
        $("#" + id).offset().top - parseInt($("#" + id).height() / 1.2),
    },
    "slow"
  );
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
      $(el).attr(
        attr,
        isDev ? val.split("...")[1] : "/impact" + val.split("...")[1]
      );
    }
  });
};

const getValues = () => {
  const gpu = $("#compute-gpu option:selected").val();
  const provider = $("#compute-provider option:selected").val();
  const region =
    provider !== "custom" ? $("#compute-region option:selected").val() : null;
  const customImpact =
    provider !== "custom"
      ? null
      : parseFloat($("#compute-custom-impact").val());
  const customOffset =
    provider !== "custom"
      ? null
      : parseFloat($("#compute-custom-offset").val());
  const hours = parseFloat($("#compute-hours").val());
  return {
    gpu,
    provider,
    region,
    hours,
    customImpact,
    customOffset,
  };
};

const scrollToBottomResultCard = () => {
  const cardOffset =
    $("#result-card").offset().top +
    $("#result-card").outerHeight() -
    $(window).height() +
    50;
  $("html, body").animate(
    {
      scrollTop: cardOffset,
    },
    1000,
    "easeInOutExpo"
  );
  return;
};

const growDivOnArrowClick = (clickId, growId) => {
  $(clickId).click(function () {
    if (!$(this).find(".arrow-icon").hasClass("open")) {
      var h = 0;
      $(growId)
        .children()
        .each((k, v) => {
          h += $(v).innerHeight();
        });
      $(growId).height(h);

      setTimeout(() => {
        if (
          $(window).height() > $("#result-card").outerHeight() + 150 &&
          !isBottomVisible()
        ) {
          scrollToBottomResultCard();
        }
      }, 500);
    } else {
      $(growId).height(0);
      setTimeout(() => {
        !isBottomVisible(50) && scrollToBottomResultCard();
      }, 500);
    }

    $(this).find(".arrow-icon").toggleClass("open");
  });
};
const growDivOnArrowClickLearn = (clickId, growId) => {
  $(clickId).click(function () {
    if (!$(this).find(".arrow-icon").hasClass("open")) {
      var h = 0;
      $(this)
        .siblings(growId)
        .children()
        .each((k, v) => {
          h += $(v).innerHeight();
        });
      $(this).siblings(growId).height(h);
    } else {
      $(this).siblings(growId).height(0);
    }
    $(this).find(".arrow-icon").toggleClass("open");
  });
};

const check = (type, value) => {
  $("#compute-hours").css("border", "");
  switch (type) {
    case "gpu":
      // console.log(state.gpus, value);
      return state.gpus.filter((v, k) => {
        return v.name === value;
      }).length;
    case "hours":
      return Number.isInteger(value) && value > 0 && value < 1e6;
    case "provider":
      return state.providers.filter((v, k) => {
        return v.name === value;
      }).length;
    case "region":
      return state.regions.filter((v, k) => {
        return v.name === value;
      }).length;
    default:
      return true;
  }
};

const checkForm = () => {
  const values = getValues();
  const { gpu, provider, region, hours } = values;
  let failed = false;

  FEATURES.forEach((v, k) => {
    if (!check(k, v)) {
      fail(k);
      failed = true;
    }
  });
  if (failed) return null;

  return values;
};

const twoDigits = (n) => Number(Number(n).toFixed(2));
const toDigits = (n, d) => Number(Number(n).toFixed(d));

const fillLatexTemplate = (
  provName,
  region,
  hours,
  gpu,
  gpuPower,
  emissions,
  offsetPercents,
  impact
) => {
  provName
    ? $("#template-text-offset").show()
    : $("#template-text-offset").hide();
  $("#template-provider").text(provName || "a private infrastructure");
  $("#template-region").text(region ? ` in region ${region}` : "");
  $("#template-region-efficiency").text(impact);
  $("#template-hours").text(hours);
  $("#template-gpu").text(gpu);
  $("#template-gpu-power").text(gpuPower);
  $("#template-emissions").text(emissions);
  $("#template-percentage-offset").text(offsetPercents);
};

const setDetails = (values) => {
  // console.log({ values });
  const { gpu, hours, provider, region, customImpact, customOffset } = values;
  const energy = twoDigits((state.gpus[gpu].watt * hours) / 1000); // kWh
  const impact = Number.isFinite(customImpact)
    ? customImpact
    : twoDigits(state.providers[provider][region].impact / 1000); // kg/kwH
  const co2 = twoDigits(energy * impact);
  const offset = Number.isFinite(customOffset)
    ? twoDigits((co2 * customOffset) / 100)
    : twoDigits((co2 * state.providers[provider][region].offsetRatio) / 100);
  const offsetPercents = Number.isFinite(customOffset)
    ? twoDigits(customOffset)
    : twoDigits(state.providers[provider][region].offsetRatio);
  const provName = Number.isFinite(customOffset)
    ? ""
    : state.providers[provider][region].providerName;
  const minRegId = Number.isFinite(customOffset)
    ? ""
    : state.providers[provider].__min.region;
  const minReg = Number.isFinite(customOffset)
    ? ""
    : state.providers[provider][minRegId];

  console.log(
    "Computation details:" +
      Object.entries(values)
        .map(([k, v]) => `\n  • ${k}: ${v}`)
        .join("")
  );

  fillLatexTemplate(
    provName,
    region,
    hours,
    gpu,
    state.gpus[gpu].watt,
    co2,
    offsetPercents,
    impact
  );
  fillComparisonTable(co2);

  $("#comparison-result-co2").text(co2);
  $("#offset-value").text(offset);
  $("#details-counts").html(`
  ${state.gpus[gpu].watt}W x ${hours}h = <strong>${energy} kWh</strong> x ${impact}
  kg  eq. CO<sub>2</sub>/kWh = <strong>${co2} kg eq. CO<sub>2</sub></strong>
  `);
  if (Number.isFinite(customOffset)) {
    $("#details-min-region").html("");
    $("#details-alternative").html("");
    $("#details-alternative-content").show();
    $("#compute-carbon-offset-title").html("Carbon offset");
  } else {
    $("#compute-carbon-offset-title").html("Carbon Already Offset by Provider");
    if (region !== minRegId) {
      const minco2 = twoDigits((energy * minReg.impact) / 1000);
      $("#details-min-selected").hide();
      $("#details-alternative").html(
        `
        Had this model been run in ${provName}'s <strong>${minReg.regionName}</strong> region,
        the carbon emitted would have been of <strong>${minco2}</strong> kg eq. CO<sub>2</sub>
        `
      );
      $("#details-alternative").show();
    } else {
      $("#details-min-selected").show();
      $("#details-alternative").hide();
      $("#details-min-region").html(
        `
        You have selected ${provName}'s cleanest region!
        `
      );
    }
  }
};

const scientificNotation = (n, d) => {
  const exp = n.toExponential() + "";
  let dec = exp.split(".")[1].split("e")[0];
  dec = dec.slice(0, d);
  const power = exp.split("e")[1];
  let n_d = parseFloat(exp.split(".")[0] + "." + dec);
  if (power === "+0") {
    n_d = toDigits(n_d * 1, d);
  } else if (power === "+1") {
    n_d = toDigits(n_d * 10, d);
  } else if (power === "+2") {
    n_d = toDigits(n_d * 100, d);
  } else if (power === "-1") {
    n_d = toDigits(n_d * 0.1, d);
  } else if (power === "-2") {
    n_d = toDigits(n_d * 0.01, d);
  } else {
    n_d += ` <small>x</small>10<sup>${power.replace("+", "")}</sup>`;
  }
  return n_d;
};

const fillComparisonTable = (co2) => {
  $("#emitted-value").text(co2);
  // https://www.epa.gov/energy/greenhouse-gases-equivalencies-calculator-calculations-and-references

  const DIGITS = 2;
  // # Miles driven by the average passenger vehicle
  // 3.98 x 10-4 metric tons CO2E/mile
  const kgC02PerKm = (3.98 * 1e-4 * 1e3) / 1.609344;
  const eqDriven = scientificNotation(co2 / kgC02PerKm, DIGITS);
  // # Pounds of coal burned
  // 9.05 x 10-4 metric tons CO2/pound of coal
  const kgCoalBurnedPerKg = 9.05 * 1e-4 * 1e3 * 2.204623;
  const eqCoal = scientificNotation(co2 / kgCoalBurnedPerKg, DIGITS);
  // https://www.epa.gov/energy/greenhouse-gases-equivalencies-calculator-calculations-and-references#seedlings
  //  0.060 metric ton CO2 per urban tree planted (sequestered)
  const kgC02SequestratedBySeedling = 0.06 * 1e3;
  const eqForest = scientificNotation(
    co2 / kgC02SequestratedBySeedling,
    DIGITS
  );

  $("#comparison-result-driven").html(eqDriven);
  $("#comparison-result-coal").html(eqCoal);
  $("#comparison-result-forest").html(eqForest);
};

const isBottomVisible = (_bottomOffset) => {
  const bottomOffset = _bottomOffset || 0;
  return (
    $("#result-card").offset().top +
      $("#result-card").outerHeight() +
      bottomOffset <
    $(window).scrollTop() + $(window).height()
  );
};

const submitCompute = (_values) => {
  $("#result-card").hide();
  $("#comparison-row").hide();
  $("#details-content").height(0);
  $("#details-banner .arrow-icon").removeClass("open");
  $(".spinner-border").show();
  // const values = _values ? _values : checkForm();
  const values = getValues();
  if (!values) return;

  setDetails(values);
  state.current = values;

  setTimeout(() => {
    $(".spinner-border").hide();
    $("#result-card").fadeIn();
    $("#comparison-row").fadeIn();
    $("#compute-carbon-emitted-title").height(
      $("#compute-carbon-offset-title").height()
    );

    // console.log($(window).scrollTop() + $(window).height());

    if ($(window).width() < 769 || !isBottomVisible()) {
      scrollToBottomResultCard();
    }
  }, getRandomInt(500, 1500));
};

const setRegions = (provider) => {
  if (provider === "custom") {
    $("#compute-region-div").fadeOut(() => {
      $(".custom-hidable").fadeIn();
    });
  } else {
    if (!$("#compute-region-div").is(":visible")) {
      $(".custom-hidable").fadeOut(() => {
        $("#compute-region-div").fadeIn();
      });
    }
    $("#compute-region").html("");
    let regs = [];
    for (const region in state.providers[provider]) {
      if (
        state.providers[provider].hasOwnProperty(region) &&
        region !== "__min"
      ) {
        let { regionName } = state.providers[provider][region];
        if (!regionName) {
          regionName = region;
        }
        regs.push({ region, regionName });
      }
    }
    regs.sort((a, b) =>
      a.regionName > b.regionName ? 1 : b.regionName > a.regionName ? -1 : 0
    );
    for (const reg of regs) {
      const { regionName, region } = reg;
      $("#compute-region").append(
        `<option value="${region}">${regionName}</option>`
      );
    }
  }
};

const setInputs = () => {
  for (const gpuName of Object.keys(state.gpus).sort()) {
    const selected = gpuName === "Tesla V100" ? "selected" : "";
    $("#compute-gpu").append(
      `<option ${selected} value="${gpuName}">${gpuName}</option>`
    );
  }
  let prov;
  let i = 0;
  for (const provider in state.providers) {
    if (i == 0) prov = provider;
    i++;
    if (state.providers.hasOwnProperty(provider)) {
      let providerName;
      for (const region in state.providers[provider]) {
        if (
          state.providers[provider].hasOwnProperty(region) &&
          region !== "__min"
        ) {
          providerName = state.providers[provider][region]["providerName"];
          break;
        }
      }
      $("#compute-provider").append(
        `<option value="${provider}">${providerName}</option>`
      );
    }
  }
  $("#compute-provider").append(
    `<option value="custom">Private Infrastructure</option>`
  );
  setRegions(prov);
};

(async function ($) {
  "use strict"; // Start of use strict

  // Smooth scrolling using jQuery easing
  $('a.js-scroll-trigger[href*="#"]:not([href="#"])').click(function () {
    if (
      location.pathname.replace(/^\//, "") ==
        this.pathname.replace(/^\//, "") &&
      location.hostname == this.hostname
    ) {
      var target = $(this.hash);
      target = target.length ? target : $("[name=" + this.hash.slice(1) + "]");
      if (target.length) {
        $("html, body").animate(
          {
            scrollTop: target.offset().top - 70,
          },
          1000,
          "easeInOutExpo"
        );
        let w = window.location.pathname;
        if (w[w.length - 1] !== "/") w += "/";
        window.history.pushState("", "", w + this.hash);
        return false;
      }
    }
  });

  // Closes responsive menu when a scroll trigger link is clicked
  $(".js-scroll-trigger").click(function () {
    $(".navbar-collapse").collapse("hide");
  });

  // // Activate scrollspy to add active class to navbar items on scroll
  // $('body').scrollspy({
  //   target: '#mainNav',
  //   offset: 100
  // });
  // $('[data-spy="scroll"]').on('activate.bs.scrollspy', function () {
  //   console.log(this);
  // })

  // lazy load resources as images and iframes
  const observer = lozad();
  observer.observe();

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
    $("#compute-container").fadeIn();
  });

  setInputs();
  setImports(serveFrom, "a", "href");
  setImports(serveFrom, "img", "src");
  // $('select').selectize();

  $("#compute-provider").change((e) => {
    const provider = $("#compute-provider option:selected").val();
    setRegions(provider);
  });

  $("#compute-form").submit((e) => {
    submitCompute();
    return false;
  });

  $(".details-summary").each((i, el) => {
    if (i % 2 == 0 || $(window).width() < 770) {
      const arrowTemplate = `
      <a class="arrow-icon arrow-learn-even" title="Learn more">
      <span class="left-bar"></span>
      <span class="right-bar"></span>
      </a>
      `;
      $(el).append($(arrowTemplate));
    } else {
      const arrowTemplate = `
      <a class="arrow-icon arrow-learn-odd" title="Learn more">
      <span class="left-bar"></span>
      <span class="right-bar"></span>
      </a>
      `;
      $(el).css("justify-content", "flex-end");
      $(el).prepend($(arrowTemplate));
    }
  });

  growDivOnArrowClickLearn(`.details-summary`, `.summary-content`);
  growDivOnArrowClick("#details-banner", "#details-content");

  // $("#details-featured-maps").click()

  // const response = await fetch("https://api.co2signal.com/v1/latest?lon=6.8770394&lat=45.9162776", {
  //   credentials: "include",
  //   headers: {
  //     'Content-Type': 'application/jsonp',
  //     'auth-token': 'c5f38468eddd9edb'
  //   }
  // })
  // console.log({ response });

  $("#copy-template-btn").click(() => {
    selectAndCopyText("template-code");
    $("#copy-template-feedback").fadeIn(() => {
      setTimeout(() => {
        $("#copy-template-feedback").fadeOut();
      }, 1000);
    });
  });

  // const response = await fetch("https://api.co2signal.com/v1/latest?lon=6.8770394&lat=45.9162776", {
  //   credentials: "include",
  //   headers: {
  //     'Content-Type': 'application/jsonp',
  //     'auth-token': 'c5f38468eddd9edb'
  //   }
  // })
  // console.log({ response });
})(jQuery); // End of use strict
