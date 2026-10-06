package com.letdownscaffold.spotifyauth

import android.app.Activity
import android.content.Intent
import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.Promise
import com.spotify.sdk.android.auth.AuthorizationClient
import com.spotify.sdk.android.auth.AuthorizationRequest
import com.spotify.sdk.android.auth.AuthorizationResponse


class SpotifyAuthModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext), ActivityEventListener {

  private var pendingPromise: Promise? = null

  companion object {
    const val REQUEST_CODE = 1337
  }

  init {
    reactContext.addActivityEventListener(this)
  }

  override fun getName(): String = "SpotifyAuth"

  @ReactMethod
  fun authorize(clientId: String, redirectUri: String, scopes: ReadableArray, promise: Promise) {
    val activity: Activity? = currentActivity

    if (activity == null) {
      promise.reject("NO_ACTIVITY", "No hay actividad disponible para abrir el login de Spotify")
      return
    }

    if (pendingPromise != null) {
      promise.reject("ALREADY_IN_PROGRESS", "Ya hay un login de Spotify en curso")
      return
    }

    pendingPromise = promise

    val scopesArray = Array(scopes.size()) { i -> scopes.getString(i) ?: "" }

    val builder = AuthorizationRequest.Builder(
      clientId,
      AuthorizationResponse.Type.CODE,
      redirectUri,
    )
    builder.setScopes(scopesArray)
    val request = builder.build()

    AuthorizationClient.openLoginActivity(activity, REQUEST_CODE, request)
  }

  override fun onActivityResult(activity: Activity?, requestCode: Int, resultCode: Int, intent: Intent?) {
    if (requestCode != REQUEST_CODE) return

    val promise = pendingPromise
    pendingPromise = null

    if (promise == null) return

    val response = AuthorizationClient.getResponse(resultCode, intent)

    when (response.type) {
      AuthorizationResponse.Type.CODE -> {
        val result = Arguments.createMap()
        result.putString("type", "success")
        result.putString("code", response.code)
        promise.resolve(result)
      }
      AuthorizationResponse.Type.ERROR -> {
        promise.reject("SPOTIFY_AUTH_ERROR", response.error ?: "Error desconocido de Spotify")
      }
      else -> {
        val result = Arguments.createMap()
        result.putString("type", "cancelled")
        promise.resolve(result)
      }
    }
  }

  override fun onNewIntent(intent: Intent?) {
  }
}
