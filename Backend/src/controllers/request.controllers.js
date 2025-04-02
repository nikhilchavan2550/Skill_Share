import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { UnRegisteredUser } from "../models/unRegisteredUser.model.js";
import { generateJWTToken_username } from "../utils/generateJWTToken.js";
import { Request } from "../models/request.model.js";
import { Chat } from "../models/chat.model.js";
import mongoose from "mongoose";

export const createRequest = asyncHandler(async (req, res, next) => {
  console.log("\n******** Inside createRequest Controller function ********");

  let { receiverID, message } = req.body;
  const senderID = req.user._id;

  console.log("Sender ID: ", senderID);
  console.log("Receiver ID: ", receiverID);
  console.log("Message: ", message);

  // Try to find user by username if receiverID is not a valid ObjectId
  try {
    if (!mongoose.Types.ObjectId.isValid(receiverID)) {
      const user = await User.findOne({ username: receiverID });
      if (user) {
        receiverID = user._id;
        console.log("Converting username to ID: ", receiverID);
      } else {
        throw new ApiError(404, "User not found");
      }
    }
  } catch (error) {
    console.error("Error finding user:", error);
    throw new ApiError(400, "Invalid receiver ID or username");
  }

  const existingRequest = await Request.find({ sender: senderID, receiver: receiverID });

  if (existingRequest.length > 0) {
    throw new ApiError(400, "Request already exists");
  }

  const receiver = await Request.create({
    sender: senderID,
    receiver: receiverID,
    message: message || "I would like to connect with you!"
  });

  if (!receiver) return next(new ApiError(500, "Request not created"));

  res.status(201).json(new ApiResponse(201, receiver, "Request created successfully"));
});

export const getRequests = asyncHandler(async (req, res, next) => {
  console.log("\n******** Inside getRequests Controller function ********");

  const receiverID = req.user._id;

  try {
    const requests = await Request.find({ receiver: receiverID, status: "Pending" }).populate("sender");
    
    console.log(`Found ${requests.length} pending requests for user ${receiverID}`);
    
    if (requests.length === 0) {
      return res.status(200).json(new ApiResponse(200, [], "No pending requests found"));
    }

    // Format the response to include both sender info and request details
    const formattedRequests = requests.map(request => {
      console.log("Processing request:", request._id);
      console.log("Sender data:", request.sender);
      
      // Create a properly structured response with sender as an object
      return {
        _id: request._id,
        message: request.message || "Would like to connect with you!",
        status: request.status,
        createdAt: request.createdAt,
        // Include the complete sender object with _id
        sender: {
          _id: request.sender?._id || request.sender,
          name: request.sender?.name || "Unknown User",
          username: request.sender?.username || "unknown",
          picture: request.sender?.picture,
          skillsProficientAt: request.sender?.skillsProficientAt || []
        }
      };
    });

    console.log("Formatted requests:", formattedRequests);
    return res.status(200).json(new ApiResponse(200, formattedRequests, "Requests fetched successfully"));
  } catch (error) {
    console.error("Error fetching requests:", error);
    return res.status(500).json(new ApiResponse(500, [], "Error fetching requests"));
  }
});

export const acceptRequest = asyncHandler(async (req, res, next) => {
  console.log("\n******** Inside acceptRequest Controller function ********");

  const { requestId, senderId } = req.body;
  const receiverId = req.user._id;

  console.log("RequestId:", requestId);
  console.log("Receiver ID (current user):", receiverId);
  console.log("Sender ID from request:", senderId);

  // First try to find the request directly
  let request = await Request.findById(requestId);
  
  if (!request) {
    console.log("Request not found by ID, trying to find by sender/receiver");
    // If the request wasn't found by ID, try the old way of finding by sender/receiver
    request = await Request.findOne({ 
      $or: [
        { sender: senderId, receiver: receiverId, status: "Pending" },
        { _id: requestId, status: "Pending" } 
      ]
    });
  }

  if (!request) {
    console.log("Request not found with either method");
    throw new ApiError(400, "Request does not exist or has already been processed");
  }

  console.log("Found request:", request);
  
  // Get the actual sender ID from the request object
  const actualSenderId = request.sender;
  
  // Check if chat already exists
  const existingChat = await Chat.findOne({ 
    users: { 
      $all: [actualSenderId, receiverId] 
    } 
  });

  if (existingChat) {
    console.log("Chat already exists:", existingChat);
    // Update the request status to connected anyway
    await Request.findByIdAndUpdate(request._id, { status: "Connected" });
    return res.status(200).json(new ApiResponse(200, existingChat, "Already connected with this user"));
  }

  // Create a new chat
  console.log("Creating new chat between:", actualSenderId, "and", receiverId);
  const chat = await Chat.create({
    users: [actualSenderId, receiverId],
  });

  if (!chat) {
    console.log("Failed to create chat");
    return next(new ApiError(500, "Chat not created"));
  }

  // Populate the chat with user information for the response
  const populatedChat = await Chat.findById(chat._id)
    .populate({
      path: "users",
      select: "name email username picture skillsProficientAt"
    });
  
  if (!populatedChat) {
    console.log("Failed to populate chat with user information");
    return next(new ApiError(500, "Error retrieving chat details"));
  }

  // Update the request status
  console.log("Updating request status to Connected");
  await Request.findByIdAndUpdate(request._id, { status: "Connected" });

  console.log("Successfully created chat:", populatedChat);
  res.status(201).json(new ApiResponse(201, populatedChat, "Request accepted successfully"));
});

export const rejectRequest = asyncHandler(async (req, res, next) => {
  console.log("\n******** Inside rejectRequest Controller function ********");

  const { requestId } = req.body;
  const receiverId = req.user._id;

  console.log("Request ID:", requestId);
  console.log("Receiver ID (current user):", receiverId);

  // Find the request by ID first
  let request = await Request.findById(requestId);
  
  if (!request) {
    console.log("Request not found by ID, trying to find by receiver");
    // If the request wasn't found by ID, try to find by receiver
    request = await Request.findOne({ 
      receiver: receiverId, 
      status: "Pending",
      _id: requestId
    });
  }

  if (!request) {
    console.log("Request not found with either method");
    throw new ApiError(400, "Request does not exist or has already been processed");
  }

  console.log("Found request to reject:", request);
  
  // Update the request status
  await Request.findByIdAndUpdate(request._id, { status: "Rejected" });

  console.log("Successfully rejected request");
  res.status(200).json(new ApiResponse(200, null, "Request rejected successfully"));
});
