export const handler = async () => {
  return [
    {
      id: "tf-123",
      name: "My Awesome Book",
      completed: true,
      rating: 10,
      reviews: ["The best book ever written"],
    },
    {
      id: "def-456",
      name: "My Terrible Book",
      completed: true,
      rating: 3,
      reviews: ["What was this 💩!"],
    },
  ];
};