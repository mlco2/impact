var dev_base_data_url =
  "https://raw.githubusercontent.com/mlco2/impact/master/data/";
var prod_base_data_url =
  "https://raw.githubusercontent.com/mlco2/impact/master/data/";
var serveFrom = "dev";

const parseProvidersData = (data) => {
  let providers = {};
  let prov;
  for (const d of data) {
    const {
      provider,
      region,
      country,
      state,
      city,
      source,
      comment,
      providerName,
      offsetRatio,
    } = d;
    const impact = parseInt(d.impact, 10);
    let { regionName } = d;
    if (!regionName) {
      regionName = region;
    }
    if (!(provider in providers)) {
      providers[provider] = {
        __min: {
          impact: 10000,
          region: "",
        },
      };
    }
    if (impact < providers[provider].__min.impact) {
      providers[provider].__min = { region, impact };
    }
    providers[provider][region] = {
      regionName,
      country,
      state,
      city,
      source,
      comment,
      providerName,
      offsetRatio,
      impact: parseFloat(impact),
    };
  }
  return providers;
};

const parseGPUData = (data) => {
  let gpus = {};
  let min = 1000000;
  for (const d of data) {
    const name = d.name;
    const watt = d.tdp_watts;
    gpus[name] = {
      watt: parseFloat(watt),
    };
    if (parseFloat(watt) < min) min = parseFloat(watt);
  }
  return gpus;
};

async function getProvidersData() {
  let result;
  try {
    result = await $.ajax({
      type: "GET",
      url: prod_base_data_url + "impact.csv",
      dataType: "text",
    });
    serveFrom = "prod";
    return result;
  } catch (error) {
    try {
      result = await $.ajax({
        type: "GET",
        url: dev_base_data_url + "impact.csv",
        dataType: "text",
      });
      return result;
    } catch (error) {
      console.log("Error getting providers:");
      console.error(error);
    }
  }
}

async function getGPUData() {
  let result;
  try {
    result = await $.ajax({
      type: "GET",
      url: prod_base_data_url + "gpus.csv",
      dataType: "text",
    });
    return result;
  } catch (error) {
    try {
      result = await $.ajax({
        type: "GET",
        url: dev_base_data_url + "gpus.csv",
        dataType: "text",
      });
      return result;
    } catch (error) {
      console.log("Error getting providers:");
      console.error(error);
    }
  }
}

async function getData() {
  const proResults = await getProvidersData();
  const gpuResults = await getGPUData();
  return {
    providers: parseProvidersData($.csv.toObjects(proResults)),
    gpus: parseGPUData($.csv.toObjects(gpuResults)),
  };
}
