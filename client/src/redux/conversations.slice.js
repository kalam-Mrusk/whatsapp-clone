import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  list: [],
};

const conversationsSlice = createSlice({
  name: "conversations",
  initialState,
  reducers: {
    getConversations: (state, action) => {
      state.list = action.payload;
    },
    updateLastMessage: (state, action) => {
      const newMessage = action.payload;
      const conversationIndex = state.list.findIndex((conv) =>
        newMessage.type === "group"
          ? conv.conversationId === newMessage.groupId
          : conv.conversationId === newMessage.conversationId
      );

      if (conversationIndex !== -1) {
        // Update existing conversation's lastMessage
        state.list[conversationIndex].lastMessage = {
          message: newMessage.message,
          fileUrl: newMessage.fileUrl,
          createdAt: newMessage.createdAt,
          senderId: newMessage.senderId,
          senderName: newMessage.senderName,
          seenBy: newMessage.seenBy || [],
        };
      } else {
        // If conversation doesn't exist, add new one
        state.list.unshift({
          _id: newMessage.conversationId,
          conversationId: newMessage.conversationId,
          lastMessage: {
            message: newMessage.message,
            fileUrl: newMessage.fileUrl,
            createdAt: newMessage.createdAt,
            senderId: newMessage.senderId,
            senderName: newMessage.senderName,
            seenBy: newMessage.seenBy || [],
          },
          type: newMessage.type,
          partnerDetails: newMessage.partnerDetails || null,
          groupDetails: newMessage.groupDetails || null,
        });
      }
    },
  },
});

export const { getConversations, updateLastMessage } =
  conversationsSlice.actions;
export default conversationsSlice.reducer;
