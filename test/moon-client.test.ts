/// <reference path="./typings/tests-entry.d.ts" />

import { getMockedMoonClient, AxiosClient } from "./testUtils";
import { MutateType } from "../src/moon-client";

export const links = [
  { id: "FOO", baseUrl: "http://foo.com", interceptors: {} },
  { id: "BAR", baseUrl: "http://bar.com", interceptors: {} }
];

describe("MoonClient class", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should call the axios get function", async () => {
    const moonClient = getMockedMoonClient(links);
    await moonClient.query("FOO", "/users", { foo: "bar" });
    // @ts-ignore
    expect(moonClient.clients.FOO.get).toHaveBeenCalledWith("/users", {
      params: { foo: "bar" }
    });
    // @ts-ignore
    expect(moonClient.clients.BAR.get).not.toBeCalled();
    await moonClient.query("BAR", "/users", { foo: "bar" });
    // @ts-ignore
    expect(moonClient.clients.BAR.get).toHaveBeenCalledWith("/users", {
      params: { foo: "bar" }
    });
  });

  it("should return a response on query", async () => {
    const response = {
      users: [{ id: 1, name: "John Smith" }]
    };
    class CustomAxiosClient extends AxiosClient {
      constructor(baseUrl: string) {
        super(baseUrl);
        this.get = jest.fn().mockImplementation(() => Promise.resolve(response));
      }
    }
    const moonClient = getMockedMoonClient(links, CustomAxiosClient);
    const result = await moonClient.query("FOO", "/users", {
      foo: "bar"
    });
    expect(result).toEqual(response);
  });

  it("should call mutate", async () => {
    const moonClient = getMockedMoonClient(links);
    await moonClient.mutate("FOO", "/users", undefined, { foo: "bar" });
    // @ts-ignore
    expect(moonClient.clients.FOO.post).toHaveBeenCalledWith(
      "/users",
      {
        foo: "bar"
      },
      {}
    );
    await moonClient.mutate("FOO", "/users", MutateType.Post, { foo: "bar" });
    // @ts-ignore
    expect(moonClient.clients.FOO.post).toHaveBeenCalledWith(
      "/users",
      {
        foo: "bar"
      },
      {}
    );
    await moonClient.mutate("FOO", "/users", MutateType.Delete, { foo: "bar" });
    // @ts-ignore
    expect(moonClient.clients.FOO.delete).toHaveBeenCalledWith("/users", {
      params: { foo: "bar" }
    });
    await moonClient.mutate("FOO", "/users", MutateType.Put, { foo: "bar" });
    // @ts-ignore
    expect(moonClient.clients.FOO.put).toHaveBeenCalledWith(
      "/users",
      {
        foo: "bar"
      },
      {}
    );
  });

  it("should throw Bimm Error on query", async () => {
    const error = new Error("Bimm!");
    class CustomAxiosClient extends AxiosClient {
      constructor(baseUrl: string) {
        super(baseUrl);
        this.get = jest.fn().mockImplementation(() => Promise.reject(error));
      }
    }
    const moonClient = getMockedMoonClient(links, CustomAxiosClient);
    expect.assertions(1);
    moonClient.query("FOO", "/users", { foo: "bar" }).catch((err: Error) => {
      expect(err).toEqual(error);
    });
  });

  it("should throw Boomm Error on query", async () => {
    const error = new Error("Boomm!");
    class CustomAxiosClient extends AxiosClient {
      constructor(baseUrl: string) {
        super(baseUrl);
        this.post = jest.fn().mockImplementation(() => Promise.reject(error));
      }
    }
    const moonClient = getMockedMoonClient(links, CustomAxiosClient);
    expect.assertions(1);
    moonClient.mutate("FOO", "/users", undefined, { foo: "bar" }).catch((err: Error) => {
      expect(err).toEqual(error);
    });
  });
});
