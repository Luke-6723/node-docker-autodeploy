// initialize .env
require('dotenv').config()

// Dependencies
const express = require('express')
const fetch = require('node-fetch')
const app = express()

// Body parser middleware
const bodyparser = require('body-parser')
app.use(bodyparser.json())

// Github payload verification middleware
const verifyPayload = require('./util/verifyPayload')
app.use(verifyPayload)

// Docker API
const { Docker } = require('node-docker-api');
const docker = new Docker({ socketPath: process.env.DOCKER_SOCKET_PATH || '/var/run/docker.sock' });

// Github ping route
app.post('/', (req, res) => {
  res.status(200).send('OK')
})

// Send webhook function
/**
 * @param { String || Object<DiscordWebhookEmbed> } message The message to send to discord.
 * @return {Promise<*>}
 */
const sendWebhook = async (message) => {
  if(typeof message === 'string') message = JSON.stringify({ content: message })
  message = JSON.stringify(message)
  return await fetch(process.env.DISCORD_WEBHOOK_URL, {
    headers: {
      'Content-Type': 'application/json'
    },
    method: 'post',
    body: message
  })
}

/**
 * Colors:
 * Green => 38912
 * Red => 16525609
 */

// Post endpoint for github webhook
app.post('/github/autodeploy', async (req, res) => {
  if(req.body?.repository?.name === process.env.REPO_NAME) {
    if(req.body?.action === 'completed') {
      if(req.body?.check_run?.name === process.env.ACTION_NAME) {
        res.status(200).send('OK')
        console.log('Recieved action completion.')

        // Handle discord webhook if any
        if (process.env.DISCORD_WEBHOOK_URL) {
          console.log('Sending RECIEVE discord webhook')
          await sendWebhook({
            embeds: [{
              title: `Recieved ${process.env.ACTION_NAME} completion.`,
              color: 38912
            }]
          })
        }

        // Get container
        const container = docker.container.get(process.env.DOCKER_CONTAINER_NAME)
        // Create execution command
        return container.exec.create({
          AttachStdout: true,
          AttachStderr: true,
          Cmd: [ 'npm', 'install' ]
        }).then(async exec => {
          // Start exec
          if (process.env.DISCORD_WEBHOOK_URL) {
            console.log('Sending UPDATING discord webhook')
            await sendWebhook({
              embeds: [{
                title: `Updating dependencies`,
                color: 38912
              }]
            })
          }
          return exec.start({ detach: false })
        }).then(stream => {
          let output = ''
          stream.on('data', d => console.log(d.toString()))
          stream.on('error', e => async () => {
            console.log(e)
            if (process.env.DISCORD_WEBHOOK_URL) {
              console.log('Sending ERROR discord webhook')
              await sendWebhook({
                embeds: [{
                  title: `ERROR`,
                  description: 'Check console for more information',
                  color: 16525609
                }]
              })
            }
          })
          stream.on('end', async () => {
            if (process.env.DISCORD_WEBHOOK_URL) {
              console.log('Sending SUCCESS discord webhook')
              await sendWebhook({
                embeds: [{
                  title: `Successfully updated dependencies`,
                  color: 38912
                }]
              })
              await sendWebhook({
                embeds: [{
                  title: `Restarting container`,
                  color: 16525609
                }]
              })
            }
            return container.exec.create({
              AttachStdout: true,
              AttachStderr: true,
              Cmd: [ 'npm', 'install' ]
            }).then(async exec => {
              // Start exec
              if (process.env.DISCORD_WEBHOOK_URL) {
                console.log('Sending UPDATING discord webhook')
                await sendWebhook({
                  embeds: [{
                    title: `Pulled from git successfully`,
                    color: 38912
                  }]
                })
              }
              return exec.start({ detach: false })
            }).then(stream => {
              let output = ''
              stream.on('data', d => console.log(d.toString()))
              stream.on('error', e => async () => {
                console.log(e)
                if (process.env.DISCORD_WEBHOOK_URL) {
                  console.log('Sending ERROR discord webhook')
                  await sendWebhook({
                    embeds: [{
                      title: `ERROR`,
                      description: 'Check console for more information',
                      color: 16525609
                    }]
                  })
                }
              })
              stream.on('end', async () => {
                if (process.env.DISCORD_WEBHOOK_URL) {
                  console.log('Sending SUCCESS discord webhook')
                  await sendWebhook({
                    embeds: [{
                      title: `Successfully updated dependencies`,
                      color: 38912
                    }]
                  })
                  await sendWebhook({
                    embeds: [{
                      title: `Restarting container`,
                      color: 26623
                    }]
                  })
                }
                container.restart().then(async () => {
                  console.log('Updated container successfully')
                  if (process.env.DISCORD_WEBHOOK_URL) {
                    console.log('Sending SUCCESS discord webhook')
                    await sendWebhook({
                      embeds: [{
                        title: `Successfully deployed update.`,
                        color: 38912
                      }]
                    })
                  }
                })
              })
            })
          })
        })
      } else res.status(400)
    } else res.status(400)
  } else res.status(400)
})

// Allow lowercase and uppercase
const PORT = Number(process.env.PORT) || Number(process.env.port)
const HOST = process.env.HOST || process.env.host

// Listen
app.listen(PORT, HOST, () => {
  console.log(`Listening on ${HOST}:${PORT}`)
})