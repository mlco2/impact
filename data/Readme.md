# MLCO2' Data

As much as possible we added sources and comments to the data we use in the calculator.

It could be that some pieces of data are erroneous or become oudated. The purpose of hosting the data here on Github is to make it debatable and collectively improvable through issues and pull requests. Jump in!

## Adding a provider

Open a pull-request with the data you'd like to add to `impact.csv`. Each line represents a region of compute. The following columns are mandatory:

* `provider`: (string) short lowercase code for the provider
* `providerName`: (string) complete, verbose name
* `offsetRatio`: (int) percentage of carbon emissions the provider offsets for this region
* `region`: (string) short lowercase code for the region
* `regionName`: (string) complete, verbose region name. Defaults to `name` if absent
* `impact`: (float | int) number of gCO2eq / kWh