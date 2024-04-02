/*
    dataAPI() returns an object with two api methods you can cell to get data:
        getNames() - Retrieves a list of data items with names and ids
        getCounts() - Retrieves a list of data items with counts and ids
    Both return promises that resolve after a few seconds with the requested data (or possibly reject with an error message).

    tableModule() returns an object with one method: intance(). It is provided here for you to use
        like a 3rd party library for a table widget (though it's actually quite primitive). Here is the documentation on
        how to configure your table:

        intance(id, options) - Finds an element on the page with matching id, and builds a table using the provided options.
            options: {
                dataSource: An array of data items, each an object containing one or more fields of data.
                    Example: [{ field1: 2, field2: 'foo' }, { field1: 5, field2: 'bar'}, ...]
                columns: An array of column configurations. Each should be an object with the following properties:
                    sourceField: The name of the field in each data item to use for this column's values
                    caption: The title of the column to display at the top
                    format(value) (optional): A callback function that is executed for each value. It provides the value
                        as the only parameter, and should return the formatted version of the value to display
                    Example: [{ sourceField: 'field1', caption: 'Dollars', format: (num) => '$' + num }, { sourceField: 'field2', caption: 'Text' }]
            }
*/
/**
 * Asynchronously loads data using provided dataAPI.
 * @returns {Promise<{names: {id:number,name:string}, counts: {id:number,count:number}}>} A Promise that resolves with an object containing names and counts.
 */
const loadData = async () => {
  try {
    const { getNames, getCounts } = dataAPI();
    const [names, counts] = await Promise.all([getNames(), getCounts()]);

    const namesMap = new Map(names.map(name => [name.id, name]));

    const totalCount = counts.reduce((total, item) => total + item.count, 0);

    const combinedData = counts
      .filter(countItem => namesMap.has(countItem.id))
      .map(countItem => {
        const name = namesMap.get(countItem.id);
        return {
          id: countItem.id,
          name: name.name,
          count: countItem.count,
          percentOfTotal: countItem.count / totalCount
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));

    const columns = [
      { sourceField: 'name', caption: 'Name' },
      { sourceField: 'count', caption: 'Count' },
      {
        sourceField: 'percentOfTotal',
        caption: 'Percent of Total',
        format: value => (value * 100).toFixed(2) + '%'
      }
    ];

    const TM = tableModule();
    TM.instance('table', {
      dataSource: combinedData,
      columns: columns
    });
  } catch (error) {
    console.error("Error loading data:", error);
    throw error;
  }
};

document.getElementById('table').innerHTML = '<p>Loading Data....</p>';

loadData()
  .catch(err => {
    console.error('Error fetching data:', err);
    document.getElementById('table').innerHTML = '<p>Error fetching data. Please try again later.</p>';
  });
