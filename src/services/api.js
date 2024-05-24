// Set Auth TokenresponseJSON with mock user data and JWTs

// Set domain id
export const setDomainId = async () => {
  try {
    const domainData = await fetchAllDomain();
    const domain_id = domainData.payload[0].id;
    return domain_id;
  } catch (error) {
    console.error('Error setting domain_id:', error.message);
    throw new Error('Unable to determine domain_id');
  }
};

// Utility function to fetch data from the API with authentication headers
export const fetchData = async (url, method = 'GET', body = null, token = null) => {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['x-vouch-idp-accesstoken'] = token;
    } else {
      // Fetch the access token if not provided
      if (process.env.NODE_ENV === 'development') {
        const responseJSON = await fetch("/api/cis/v1/mock/users-auth");
        const json = await responseJSON.json();
        token = json.payload["Name1 Surname1"];
      }
      options.headers['x-vouch-idp-accesstoken'] = token;
    }

    if (body) {
      options.body = JSON.stringify(body);
    }

  const response = await fetch(url, options);

  if (response.ok) {
    const data = await response.json();
    return data;
  } else {
    throw new Error(`Failed to fetch data from ${url}. Status: ${response.status}, StatusText: ${response.statusText}`);
  }
} catch (error) {
  throw new Error(`Error fetching data from ${url}: ${error.message}`);
}
};

export const createImplementation = async (elementId, implementationData, token) => {
  const domain_id = await setDomainId();
  const url = `/api/cis/v1/inventory/domain/${domain_id}/element/${elementId}/implementation`;
  
  return fetchData(url, 'POST', implementationData, token);
};

export const createInventoryDomain = async (domainData, token) => {
  return fetchData(`/api/cis/v1/inventory/domain`, 'POST', domainData, token);
};

export const createInventoryClass = async (classData, token) => {
  return fetchData('/api/cis/v1/inventory/class', 'POST', classData, token);
};

export const createInventoryElement = async (elementData, token) => {
  const domainId = await setDomainId();
  return fetchData(`/api/cis/v1/inventory/domain/${domainId}/element`, 'POST', elementData, token);
};

export const updateElement = async (elementId, updatedElementData, token) => {
  const domainId = await setDomainId();
  const url = `/api/cis/v1/inventory/domain/${domainId}/element/${elementId}`;

  return fetchData(url, 'PUT', updatedElementData, token);
};

export const updateInventoryDomain = async (domainId, requestBody, token) => {
  const url = `/api/cis/v1/inventory/domain/${domainId}`;
  return fetchData(url, 'PUT', requestBody, token);
};

export const getRootElements = async (token) => {
  const domainId = await setDomainId();
  const url = `/api/cis/v1/inventory/domain/${domainId}/roots`;
  return fetchData(url, 'GET', null, token);
};

export const getChildElements = async (elementId, token) => {
  const domainId = await setDomainId();
  const url = `/api/cis/v1/inventory/domain/${domainId}/element/${elementId}/children`;
  return fetchData(url, 'GET', null, token);
};

export const fetchImplementation = async (elementId, token) => {
  const domainId = await setDomainId();
  const url = `/api/cis/v1/inventory/domain/${domainId}/element/${elementId}/implementation`;
  return fetchData(url, 'GET', null, token);
};

export const fetchInventoryData = async (token) => {
  const domainId = await setDomainId();
  const url = `/api/cis/v1/inventory/domain/${domainId}`;
  return fetchData(url, 'GET', null, token);
};

export const fetchDomain = async (token) => {
  const domainId = await setDomainId();
  const url = `/api/cis/v1/inventory/domain/${domainId}`;
  return fetchData(url, 'GET', null, token);
};

export const fetchClass = async (classId, token) => {
  const url = `/api/cis/v1/inventory/class/${classId}`;
  return fetchData(url, 'GET', null, token);
};

export const fetchElement = async (elementId, token) => {
  const domainId = await setDomainId();
  const url = `/api/cis/v1/inventory/domain/${domainId}/element/${elementId}`;
  return fetchData(url, 'GET', null, token);
};

export const fetchAllDomain = async () => {
  return await fetchData('/api/cis/v1/inventory/domain');
};

export const fetchAllClass = async (token) => {
  return fetchData('/api/cis/v1/inventory/class', 'GET', null, token);
};

export const fetchProfile = async (token) => {
  return fetchData('/api/cis/v1/auth/me', 'GET', null, token);
};

export const fetchAllElements = async (limit = 10, page = 1, anchorId = null, searchQuery = "", token) => {
  const domainId = await setDomainId();
  const searchParam = searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : "";
  const url = `/api/cis/v1/inventory/domain/${domainId}/element?limit=${limit}&page=${page}${anchorId ? `&anchorId=${anchorId}` : ''}${searchParam}`;
  return fetchData(url, 'GET', null, token);
};

export const fetchPath = async (elementId, pathType, token) => {
  const domainId = await setDomainId();
  const queryParams = new URLSearchParams({ pathType });
  const url = `/api/cis/v1/inventory/domain/${domainId}/element/${elementId}/path?${queryParams}`;
  return fetchData(url, 'GET', null, token);
};

export default {};
