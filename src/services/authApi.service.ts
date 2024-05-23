export const authApi = {
  async post(endpoint: any, data: any, dataType: string, withAuth: boolean) {
    try {
      const token = localStorage.getItem("token");
      const headers = {
        ...(dataType === "json" ? { "Content-Type": "application/json" } : {}),
        ...(withAuth && token ? { Authorization: `Bearer ${token}` } : {}),
      };
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_URL}${endpoint}`,
        {
          method: "POST",
          headers: headers,
          body: dataType === "json" ? JSON.stringify(data) : data,
        }
      );

      return response.json();
    } catch (error) {
      throw new Error(`Error during API request: ${error}`);
    }
  },
  async get(endpoint: any, withAuth: boolean, signal?: AbortSignal) {
    try {
      const token = localStorage.getItem("token");
      const headers = {
        ...(withAuth && token ? { Authorization: `Bearer ${token}` } : {}),
      };
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_URL}${endpoint}`,
        {
          method: "GET",
          signal: signal,
          headers: headers,
        }
      );
      return response.json();
    } catch (error) {
      throw new Error(`Error during API request: ${error}`);
    }
  },
  async put(endpoint: string, data: any, dataType: string, withAuth: boolean) {
    try {
      const token = localStorage.getItem("token");
      const headers = {
        ...(dataType === "json" ? { "Content-Type": "application/json" } : {}),
        ...(withAuth && token ? { Authorization: `Bearer ${token}` } : {}),
      };
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_URL}${endpoint}`,
        {
          method: "POST",
          headers: headers,
          body: dataType === "json" ? JSON.stringify(data) : data,
        }
      );

      return response.json();
    } catch (error) {
      throw new Error(`Error during API request: ${error}`);
    }
  },
};
