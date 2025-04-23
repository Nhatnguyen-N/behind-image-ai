import prisma from "@/lib/prisma";
export const POST = async (req: Request) => {
  try {
    const { image, clerkId } = await req.json();
    const buffer = Buffer.from(image, "base64");
    const blob = new Blob([buffer], { type: "image/jpeg" });
    //create a from data:
    const fromData = new FormData()
    fromData.append("size", 'auto')
    fromData.append("image_file", blob, "image.jpg")
    console.log("Sending request to removeBg API ...");
    const response = await fetch("https://api/remove.bg/v1.0/removebg", {
      method: 'POST',
      headers: {
        "X-Api-Key": process.env.REMBG_API_KEY as string,
      },
      body: fromData
    });
    console.log("Response status:", response.status);
    if (!response.ok) {
      const errorText = await response.text();
      console.log("API error: ", errorText);
      throw new Error(`${response.status}:${response.statusText}`)
    }
    const resultBlob = await response.blob()
    const arrayBuffer = await resultBlob.arrayBuffer()
    console.log("Recieved processed image blog");
    const resultBase64 = Buffer.from(arrayBuffer).toString("base64");

    //update th db:
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: {
        plan: true,
        id: true,
        creditsLeft: true
      }
    })
    if (!user) {
      throw new Error("User not found");
    }
    const updatedUser = await prisma.user.update({
      where: {
        clerkId
      },
      data: {
        creditsUsed: {
          increment: 1
        },
        ...(user.plan === "FREE" && {
          creditsLeft: {
            decrement: 1
          }
        }),
      },
      select: { creditsLeft: true }
    });
    return Response.json(
      {
        data: resultBase64,
        creditsLeft: updatedUser.creditsLeft
      }, { status: 200 }
    )
  } catch (error) {
    console.log(error);
    return Response.json({ data: { error: error } }, { status: 500 })

  }
}