# MLCO2's Data

As much as possible we added sources and comments to the data we use in the calculator.

Main sources are: 

* [Emissions & Generation Resource Integrated Database (eGRID) - 2016](https://www.epa.gov/energy/emissions-generation-resource-integrated-database-egrid)
* [Electricity Map - 2021](https://www.electricitymap.org/?page=map&solar=false&remote=true&wind=false)
* [Electricity carbon intensity in European Member States: Impacts on GHG emissions of electric vehicles - 2017](https://www.sciencedirect.com/science/article/pii/S1361920916307933	)
* [Carbon Footprint's Country specific electricity factors - 2018](https://www.carbonfootprint.com/docs/2018_8_electricity_factors_august_2018_-_online_sources.pdf)

It could be that some pieces of data are erroneous or become oudated. The purpose of hosting the data here on Github is to make it debatable and collectively improvable through issues and pull requests. Jump in!

## Adding a provider

Open a pull-request with the data you'd like to add to `impact.csv`. Each line represents a region of compute. The following columns are mandatory:

* `provider`: (string) short lowercase code for the provider
* `providerName`: (string) complete, verbose name
* `offsetRatio`: (int) percentage of carbon emissions the provider offsets for this region
* `region`: (string) short lowercase code for the region
* `regionName`: (string) complete, verbose region name. Defaults to `name` if absent
* `impact`: (float | int) number of gCO2eq / kWh
