import api from "./api";



export const getTree = async (identifier) => 
    (await api.get("/avl", { params: {identifier: identifier} })).data;

export const avlGetItem = async (identifier, id) => 
    (await api.get(`/avl/${id}`, { params: {identifier: identifier} })).data;

export const avlInsert = async (body) =>
    (await api.post("/avl/insert", body)).data


export const avlClear = async (identifier) => { 
    api.delete("/avl/clear", {data: {identifier:identifier}})
}

export const avlRemove = async (body) => 
    (await api.delete("/avl/remove", {data: body})).data

export const topsort = async (edgeList, startNode) =>
    (await api.post("/topsort", {start: startNode, edges: edgeList}))




export const getRequest = async (any_params) => 
    (await api.get("/path", { params: any_params })).data;

export const postRequest = (body) => 
    api.post("/path", body);

export const updateRequest = (id, body) =>
    api.patch(`/${id}`, body);

export const deleteRequest = (id) =>
    api.delete(`/${id}`);