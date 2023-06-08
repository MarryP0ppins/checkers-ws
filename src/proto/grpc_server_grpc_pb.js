// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('grpc');
var grpc_server_pb = require('./grpc_server_pb.js');

function serialize_grpc_server_CreateGamePartialUpdateRequest(arg) {
  if (!(arg instanceof grpc_server_pb.CreateGamePartialUpdateRequest)) {
    throw new Error('Expected argument of type grpc_server.CreateGamePartialUpdateRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_grpc_server_CreateGamePartialUpdateRequest(buffer_arg) {
  return grpc_server_pb.CreateGamePartialUpdateRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_grpc_server_CreateGameRequest(arg) {
  if (!(arg instanceof grpc_server_pb.CreateGameRequest)) {
    throw new Error('Expected argument of type grpc_server.CreateGameRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_grpc_server_CreateGameRequest(buffer_arg) {
  return grpc_server_pb.CreateGameRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_grpc_server_CreateMoveRequest(arg) {
  if (!(arg instanceof grpc_server_pb.CreateMoveRequest)) {
    throw new Error('Expected argument of type grpc_server.CreateMoveRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_grpc_server_CreateMoveRequest(buffer_arg) {
  return grpc_server_pb.CreateMoveRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_grpc_server_GameResponse(arg) {
  if (!(arg instanceof grpc_server_pb.GameResponse)) {
    throw new Error('Expected argument of type grpc_server.GameResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_grpc_server_GameResponse(buffer_arg) {
  return grpc_server_pb.GameResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_grpc_server_MoveResponse(arg) {
  if (!(arg instanceof grpc_server_pb.MoveResponse)) {
    throw new Error('Expected argument of type grpc_server.MoveResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_grpc_server_MoveResponse(buffer_arg) {
  return grpc_server_pb.MoveResponse.deserializeBinary(new Uint8Array(buffer_arg));
}


var GameControllerService = exports.GameControllerService = {
  create: {
    path: '/grpc_server.GameController/Create',
    requestStream: false,
    responseStream: false,
    requestType: grpc_server_pb.CreateGameRequest,
    responseType: grpc_server_pb.GameResponse,
    requestSerialize: serialize_grpc_server_CreateGameRequest,
    requestDeserialize: deserialize_grpc_server_CreateGameRequest,
    responseSerialize: serialize_grpc_server_GameResponse,
    responseDeserialize: deserialize_grpc_server_GameResponse,
  },
  partialUpdate: {
    path: '/grpc_server.GameController/PartialUpdate',
    requestStream: false,
    responseStream: false,
    requestType: grpc_server_pb.CreateGamePartialUpdateRequest,
    responseType: grpc_server_pb.GameResponse,
    requestSerialize: serialize_grpc_server_CreateGamePartialUpdateRequest,
    requestDeserialize: deserialize_grpc_server_CreateGamePartialUpdateRequest,
    responseSerialize: serialize_grpc_server_GameResponse,
    responseDeserialize: deserialize_grpc_server_GameResponse,
  },
};

exports.GameControllerClient = grpc.makeGenericClientConstructor(GameControllerService);
var MoveControllerService = exports.MoveControllerService = {
  create: {
    path: '/grpc_server.MoveController/Create',
    requestStream: false,
    responseStream: false,
    requestType: grpc_server_pb.CreateMoveRequest,
    responseType: grpc_server_pb.MoveResponse,
    requestSerialize: serialize_grpc_server_CreateMoveRequest,
    requestDeserialize: deserialize_grpc_server_CreateMoveRequest,
    responseSerialize: serialize_grpc_server_MoveResponse,
    responseDeserialize: deserialize_grpc_server_MoveResponse,
  },
};

exports.MoveControllerClient = grpc.makeGenericClientConstructor(MoveControllerService);
