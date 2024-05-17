// Set Auth TokenresponseJSON with mock user data and JWTs
const extractJWT = async () => {
  if (process.env.NODE_ENV === 'development') {
    // Execute only in development environment
    const responseJSON = await fetch("/api/cis/v1/mock/users-auth");
    const json = await responseJSON.json();
    const token = json.payload["Name1 Surname1"];
    return token;
  } else {
    // In production, retrieve the token from local storage or cookies
    const token = localStorage.getItem('dev-vouch-idp-accesstoken');
    if (!token) {
      throw new Error('No authentication token found');
    }
    return token;
  }
};

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

// Function to handle GET requests
const fetchData = async (url, options = {}) => {
  const token = await extractJWT();
  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
      'x-vouch-idp-accesstoken': token,
      ...options.headers
    },
    ...options
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Error ${response.status}: ${errorData.message}`);
  }

  return await response.json();
};

// Function to handle POST requests
const postData = async (url, data, options = {}) => {
  const token = await extractJWT();
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-vouch-idp-accesstoken": token,
        ...options.headers,
      },
      body: JSON.stringify(data),
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Error ${response.status}: ${errorData.message}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error in POST request to ${url}:`, error.message);
    throw error;
  }
};

export const createImplementation = async (elementId, implementationData) => {
  const domain_id = await setDomainId();
  const url = `/api/cis/v1/inventory/domain/${domain_id}/element/${elementId}/implementation`;
  
  try {
    const data = await postData(url, implementationData);
    console.log("API.js Implementation created successfully:", data);
    alert("Implementation created successfully!");
    return data;
  } catch (error) {
    console.error("Error creating element implementation:", error.message);
    throw error;
  }
};

export const createInventoryDomain = async (domainData) => {
  try {
    const data = await postData(`/api/cis/v1/inventory/domain`, domainData);
    console.log("API.js Domain created successfully:", data);
    return data;
  } catch (error) {
    console.error("Error creating work domain:", error.message);
    throw error;
  }
};

export const createInventoryClass = async (classData) => {
  try {
    const data = await postData('/api/cis/v1/inventory/class', classData);
    console.log("API.js Class created successfully:", data);
    alert("Class created successfully!");
    return data;
  } catch (error) {
    console.error("Error creating class:", error.message);
    if (error.response) {
      console.error('Response details:', error.response);
    }
    throw error;
  }
};

export const createInventoryElement = async (elementData) => {
  try {
    const data = await postData(`/api/cis/v1/inventory/domain/${await setDomainId()}/element`, elementData);
    console.log("API.js Element created successfully:", data);
    alert("Element created successfully!");
    return data;
  } catch (error) {
    console.error("Error creating element:", error.message);
    if (error.response) {
      console.error('Response details:', error.response);
    }
    throw error;
  }
};

// Function to update an inventory element
export const updateElement = async (
  elementId,
  updatedElementData
) => {
  try {
    const token = await extractJWT();
    const domain_id = await setDomainId();
    const response = await fetch(
      `/api/cis/v1/inventory/domain/${domain_id}/element/${elementId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-vouch-idp-accesstoken": token,
        },
        body: JSON.stringify(updatedElementData),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Failed to update element: ${errorData.errorMessage || "Unknown error"}`
      );
    }

    const responseData = await response.json();
    alert("Updated Element successfully!");
    console.log(response);
    return responseData;
  } catch (error) {
    throw new Error(`Error updating element: ${error.message}`);
  }
};

export const updateInventoryDomain = async (domainId, requestBody) => {
  const domain_id = await setDomainId();
  const url = `/api/cis/v1/inventory/domain/${domain_id}`;

  try {
    const token = await extractJWT();
    // const token = await retrieveToken();
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-vouch-idp-accesstoken": token,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized: Please check your credentials");
        // Handle unauthorized access, e.g., redirect to login page
      } else {
        throw new Error("Network response was not ok");
      }
    }

    const inventoryData = await response.json();
    return inventoryData;
  } catch (error) {
    console.error("Error fetching inventory data:", error);
    throw error;
  }
};

export const getRootElements = async () => {
  const domain_id = await setDomainId();
  return await fetchData(`/api/cis/v1/inventory/domain/${domain_id}/roots`, {
    headers: {
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
    },
  });
};

export const getChildElements = async (elementId) => {
  return await fetchData(`/api/cis/v1/inventory/domain/${await setDomainId()}/element/${elementId}/children`);
};

export const fetchImplementation = async (elementId) => {
  return await fetchData(`/api/cis/v1/inventory/domain/${await setDomainId()}/element/${elementId}/implementation`);
};

export const fetchInventoryData = async () => {
  return await fetchData(`/api/cis/v1/inventory/domain/${await setDomainId()}`);
};

export const fetchDomain = async () => {
  return await fetchData(`/api/cis/v1/inventory/domain/${await setDomainId()}`);
};

export const fetchClass = async (classId) => {
  return await fetchData(`/api/cis/v1/inventory/class/${classId}`);
};

export const fetchElement = async (elementId) => {
  return await fetchData(`/api/cis/v1/inventory/domain/${await setDomainId()}/element/${elementId}`);
};

export const fetchAllDomain = async () => {
  return await fetchData('/api/cis/v1/inventory/domain');
};

export const fetchAllClass = async () => {
  return await fetchData('/api/cis/v1/inventory/class');
};

export const fetchProfile = async () => {
  return await fetchData('/api/cis/v1/auth/me');
};

export const fetchAllElements = async (limit = 10, page = 1, anchorId = null, searchQuery = "") => {
  try {
    const token = await extractJWT();
    const domain_id = await setDomainId();

    const searchParam = searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : "";

    const url = `/api/cis/v1/inventory/domain/${domain_id}/element?limit=${limit}&page=${page}${anchorId ? `&anchorId=${anchorId}` : ''}${searchParam}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-vouch-idp-accesstoken': token,
      },
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      // Log details before throwing the error
      console.error(`Failed to fetch inventory elements. URL: ${url}, Status: ${response.status}, StatusText: ${response.statusText}`);

      // Include detailed error message
      const errorData = await response.json().catch(() => null); // Try to parse JSON error response
      const errorMessage = errorData?.message || 'Unknown error';

      throw new Error(`Error fetching inventory elements. Status: ${response.status}, Message: ${errorMessage}`);
    }
  } catch (error) {
    console.error('Error fetching inventory elements:', error.message);
    throw error; // Re-throw the original error for higher-level handling
  }
};

export const fetchPath = async (elementId, pathType) => {
  try {
    const { domain_id, token } = await Promise.all([setDomainId(), extractJWT()]);
    const queryParams = new URLSearchParams({ pathType });
    const response = await fetch(`/api/cis/v1/inventory/domain/${domain_id}/element/${elementId}/path?${queryParams}`, {
      headers: {
        "Content-Type": "application/json",
        "x-vouch-idp-accesstoken": token,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage = {
        400: errorData.errorMessage || "Bad Request",
        401: "Unauthorized - Please check your credentials",
        403: "Forbidden - Access denied",
        404: "Not Found - Endpoint or resource not found",
      }[response.status] || `Server Error - ${response.status}`;

      throw new Error(`API: Error fetching path: ${errorMessage}`);
    }

    return await response.json();
  } catch (error) {
    console.error("API: Error fetching path:", error.message);
    alert("API: Network error. Please check your connection.");
    throw error;
  }
};

export default {};
