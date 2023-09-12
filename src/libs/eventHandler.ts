export default function (event: any) {
  try {
    return JSON.parse(event);
  } catch (error: any) {
    return event;
  }
}
