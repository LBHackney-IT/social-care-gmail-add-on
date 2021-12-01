// utility to convert an email object into a plain object we can save
const transmittableEmail = message => ({
  to: message.getTo(),
  from: message.getFrom(),
  subject: message.getSubject(),
  date: message.getDate(),
  body: message.getPlainBody(),
})

function send(e){
  try{

    // 1. grab secrets
    const endpoint = PropertiesService.getScriptProperties().getProperty("endpoint")
    const token = PropertiesService.getScriptProperties().getProperty("token")

    // 2. grab data
    GmailApp.setCurrentMessageAccessToken(e.gmail.accessToken)
    const message = GmailApp.getMessageById(e.gmail.messageId)
    const thread = GmailApp.getThreadById(e.gmail.threadId)
    const worker_email = Session.getActiveUser().getEmail()
    const { social_care_id, type, summary } = e.formInput

    // 3. transmit to api
    const res = UrlFetchApp.fetch(endpoint, {
      method: "post",
      headers: {
        "x-api-key": token
      },
      contentType: "application/json",
      payload : JSON.stringify({
        message: type !== "all" ? transmittableEmail(message) : undefined,
        thread: type === "all" ? thread.getMessages().map(message => transmittableEmail(message)) : undefined,
        social_care_id,
        type,
        summary,
        worker_email
      })
    })

    if(res.getResponseCode() !== 201) throw res.getContentText()

    const data = JSON.parse(res.getContentText())

    return CardService.newActionResponseBuilder()
      .setNotification(CardService.newNotification()
        .setText(`Successfully saved to resident #${social_care_id}`))
      .setOpenLink(CardService.newOpenLink()
        .setUrl(`https://social-care-service-staging.hackney.gov.uk/people/${social_care_id}/records/${data.message._id}`))

      .build()

  } catch(e) {
    console.error(e)
    return CardService.newActionResponseBuilder()
      .setNotification(CardService.newNotification().setText(`Couldn't save—please check the social care ID and make sure you've provided a summary, or try again later.`))
      .build()
  }
}
