export default function paginate({ data, limit, currentPage, url }) {
  const page = [];
  let links = [];
  let lastPage = 1;

  if (limit !== -1) {
    lastPage = Math.ceil(data.length / limit);
    links = Array(lastPage)
      .fill(true)
      .map((_blank, i) => {
        return {
          url: `${url}pb-api/product/categories?limit=${limit}&page=${i + 1}`,
          label: (i + 1).toString(),
          active: currentPage === i + 1 ? true : false,
        };
      });

    links = [
      {
        url: currentPage - 1 === 0 ? null : `${url}pb-api/categories?limit=${limit}&page=${currentPage - 1}`,
        label: '&laquo; Previous',
        active: false,
      },
      ...links,
      {
        url:
          currentPage + 1 > lastPage ? null : `${url}pb-api/product/categories?limit=${limit}&page=${currentPage + 1}`,
        label: 'Next &raquo;',
        active: false,
      },
    ];

    for (let i = (currentPage - 1) * limit; i < (currentPage - 1) * limit + limit; i++) {
      if (data[i]) {
        page.push(data[i]);
      }
    }
  }

  return {
    page,
    meta: {
      count: limit === -1 ? data.length : page.length,
      currentPage,
      from: 1,
      lastPage,
      links,
      per_page: limit === -1 ? data.length : limit,
      total: data.length,
    },
  };
}
