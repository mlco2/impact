const parseProvidersData = data => {
    let providers = {};
    let prov, min;
    for (const d of data) {
        const {
            provider,
            region,
            regionName,
            country,
            state,
            city,
            impact,
            source,
            comment,
            providerName,
            offsetRatio
        } = d;
        if (prov != provider) min = 100000;
        if (!(provider in providers)) {
            providers[provider] = {};
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
            impact: parseFloat(impact)
        }

    }
    return providers
}

const parseGPUData = data => {
    let gpus = {};
    let min = 1000000;
    for (const d of data) {
        const { name, watt } = d;
        gpus[name] = {
            watt: parseFloat(watt)
        }
        if (parseFloat(watt) < min) min = parseFloat(watt);
    }
    return gpus
}

async function getProvidersData() {
    let result;
    try {
        result = await $.ajax({
            type: "GET",
            url: "/data/impact.csv",
            dataType: "text",
        });
        return result;
    } catch (error) {
        console.error(error);
    }
}

async function getGPUData() {
    let result;
    try {
        result = await $.ajax({
            type: "GET",
            url: "/data/gpus.csv",
            dataType: "text",
        });
        return result;
    } catch (error) {
        console.error(error);
    }
}

async function getData() {
    const proResults = await getProvidersData();
    const gpuResults = await getGPUData();
    return {
        providers: parseProvidersData($.csv.toObjects(proResults)),
        gpus: parseGPUData($.csv.toObjects(gpuResults)),
    }
}
